define("PageDesigner", ["ext-base", "PageDesignerResources", "SectionDesignDataModule", "DesignViewGeneratorV2",
	"DesignSchemaBuilder", "SectionDesignerUtils", "DesignViewModelV2", "PageDesignerUtilities"],
	function(Ext, resources, designData, designViewGenerator, schemaBuilder, sectionDesignerUtils, designViewModel,
			PageDesignerUtilities) {

		/**
		 * @class Terrasoft.configuration.PageDesigner
		 * Класс модуля дизайнера карточки
		 */
		var pageDesignerClass = Ext.define("Terrasoft.configuration.PageDesigner", {
			extend: "Terrasoft.BaseObject",
			alternateClassName: "Terrasoft.PageDesigner",

			Ext: null,
			sandbox: null,
			Terrasoft: null,

			/**
			 * Признак того, что модуль инциализируется асинхронно
			 * @private
			 * @type {Boolean}
			 */
			isAsync: true,

			/**
			 * Модель представления дизайнера
			 * @private
			 * @type {Terrasoft.BaseViewModel}
			 */
			viewModel: null,

			/**
			 * Корневой элемент представления дизайнера
			 * @private
			 * @type {Ext.Element}
			 */
			renderContainer: null,

			/**
			 * Конфигурация представления дизайнера. Используется для синхронизации этапа инициализации и рендаринга.
			 * После рендеринга дизайнера, обнуляется.
			 * @private
			 * @type {Terrasoft.Component}
			 */
			schemaView: null,

			/**
			 * Регулярное выражение для определения колонок ресурсов.
			 * @private
			 * @type {RegExp}
			 */
			resourceColumnRegex: /^Resources\.(?:Strings|Images)\.(\S*)/,

			header: "",

			/**
			 * Возвращает имя редактируемой схемы.
			 * @private
			 * returns {String} Имя редактируемой схемы.
			 */
			getSchemaName: function() {
				var stepConfig = this.sandbox.publish("GetStepConfig");
				var schemaName = stepConfig.parameter;
				if (!schemaName) {
					var mainModuleName = designData.getMainModuleName();
					var moduleStructure = designData.getModuleStructure(mainModuleName);
					var modulePage = moduleStructure.pages[0];
					schemaName = modulePage.name;
				}
				return schemaName;
			},

			/**
			 * Возвращает заголовок для модуля редактирования схемы
			 * @param {String} schemaName имя схемы
			 * @returns {String} заголовок модуля
			 */
			getHeader: function(schemaName) {
				var mainModuleName = designData.getMainModuleName();
				var moduleStructure = designData.getModuleStructure(mainModuleName);
				var header = "";
				if (sectionDesignerUtils.isEmptyOrEmptyGUID(moduleStructure.typeColumnId)) {
					header = Ext.String.format(resources.localizableStrings.SinglePageHeader, moduleStructure.caption);
				} else {
					var pageCaption = "";
					Terrasoft.each(moduleStructure.pages, function(page) {
						if (page.name === schemaName) {
							pageCaption = page.pageCaption;
							return false;
						}
					});
					header = Ext.String.format(resources.localizableStrings.MultiPageHeader, moduleStructure.caption,
						pageCaption);
				}

				return header;
			},

			/**
			 * Отрисовка полученного представления схемы
			 * @private
			 * @param {Terrasoft.Component} schemaView Представление схемы
			 */
			renderSchema: function(schemaView) {
				var view = this.view;
				if (view) {
					view.destroy();
				}
				view = this.view = this.createSchemaDesignView(schemaView);
				view.bind(this.viewModel);
				view.render(this.renderContainer);
			},

			/**
			 * Обработчик события изменения выбранного элемента схемы. Вызывает перегенерацию представления схемы.
			 * @private
			 */
			onSelectedItemChanged: function() {
				var viewModel = this.viewModel;
				var schema = viewModel.get("schema");
				var selectedItem = viewModel.get("selectedItem");
				schemaBuilder.reBuild(schema, selectedItem, function(viewModelClass, view) {
					this.renderSchema(view);
				}, this);
				//this.reRender();
			},

			/**
			 * Обработчик события изменения схемы. Перегененрирует представление схемы и сохраняет схему в DesignData.
			 * @private
			 */
			onSchemaChange: function() {
				this.modifyDesignData();
				var viewModel = this.viewModel;
				var schema = viewModel.get("schema");
				var selectedItem = viewModel.get("selectedItem");
				schemaBuilder.reBuild(schema, selectedItem, function(viewModelClass, view) {
					this.renderSchema(view);
				}, this);
			},

			/**
			 * Обработчик изменения модели представления дизанйера. Обрабатывает только изменения колонок-ресурсов.
			 * Колонки с ресурсами определяется выполнением регулярного выражения {@link #resourceColumnRegex}.
			 * Изменения ресурсов схемы сохраняются в модуль DesignData. Также обновляется коллекция моделей вкладок.
			 * @private
			 * @param {Object} model Измененная модель данных. Объект BackBone.
			 * @param {Object} options Опции изменения. При прослушивании глобального события change нет возможности
			 * определить измененное свойство, поэтому при установке значения, в опциях указывается имя измененной
			 * колонки.
			 */
			onChange: function(model, options) {
				//var resourceColumnRegex = /^Resources\./;
				var changedColumnName = options.columnName;
				var regExpMatches = this.resourceColumnRegex.exec(changedColumnName);
				if (!regExpMatches) {
					return;
				}
				var resourceName = regExpMatches[1];
				var viewModel = this.viewModel;
				var newColumnValue = viewModel.get(changedColumnName);
				var schema = viewModel.get("schema");
				var modifiedResource = {
					localizableStrings: {}
				};
				modifiedResource.localizableStrings[resourceName] = newColumnValue;
				designData.modifyClientUnitResources(schema.schemaName, modifiedResource);
				var tabsConfig = viewModel.get("TabsConfig");
				var tabName = tabsConfig[changedColumnName];
				if (!tabName) {
					return;
				}
				var tabsCollection = viewModel.get("TabsCollection");
				var tabViewModel = tabsCollection.get(tabName);
				tabViewModel.set("Caption", newColumnValue);
			},

			/**
			 * Сохраняет текущий вариант схемы в DesignData.
			 * @private
			 */
			modifyDesignData: function() {
				var viewModel = this.viewModel;
				var schema = viewModel.get("schema");
				designData.modifyClientUnitSchema(schema.schemaName, schema);
			},

			/**
			 * Перегенерирует и перерисовует представление схемы.
			 * @private
			 */
			reRender: function() {
				var viewModel = this.viewModel;
				var schema = viewModel.get("schema");
				var selectedItem = viewModel.get("selectedItem");
				var viewModelClass = viewModel.get("viewModelClass");
				var viewConfig = {
					schema: schema,
					viewModelClass: viewModelClass,
					selectedItemName: selectedItem
				};
				designViewGenerator.generate(viewConfig, this.renderSchema, this);
			},

			/**
			 * Создает представление дизайнера вместе с представлением схемы
			 * @private
			 * @param {Terrasoft.Component} schemaView Представление схемы
			 * @returns {Terrasoft.Container} Представление дизайнера
			 */
			createSchemaDesignView: function(schemaView) {
				var items = [
					{
						id: "CardContainer",
						className: "Terrasoft.Container",
						selectors: {
							wrapEl: "#CardContainer"
						},
						afterrender: {
							bindTo: "onViewRendered"
						},
						classes: {
							wrapClassName: ["designer"]
						},
						items: schemaView
					},
					{
						className: "Terrasoft.Button",
						name: "Add",
						caption: resources.localizableStrings.Add,
						style: this.Terrasoft.controls.ButtonEnums.style.BLUE,
						classes: {
							wrapperClass: ["add-detail-button"]
						},
						menu: {
							items: [{
								caption: resources.localizableStrings.AddFieldGroup,
								click: {
									bindTo: "addGroup"
								}
							}, {
								caption: resources.localizableStrings.AddDetail,
								click: {
									bindTo: "addDetail"
								}
							}]
						}
					},
					{
						className: "Terrasoft.Button",
						name: "ChangeOrder",
						caption: resources.localizableStrings.ChangeOrder,
						style: this.Terrasoft.controls.ButtonEnums.style.DEFAULT,
						classes: {
							textClass: ["sort-button"]
						},
						click: {
							bindTo: "sortCurrentTab"
						}
					}
				];

				var view = this.Ext.create("Terrasoft.Container", {
					id: "DesignerContainer",
					className: "Terrasoft.Container",
					selectors: {
						wrapEl: "#DesignerContainer"
					},
					items: items
				});

				return view;
			},

			/**
			 * Обработчик завершения процесса построения схемы. Создает и инициализирует модель представления дизайнера.
			 * @private
			 * @param {Terrasoft.BaseViewModel} viewModelClass Класс модели представления схемы.
			 * @param {Terrasoft.Component} schemaView Представление схемы.
			 * @param {Object} schema Схема карточки редактирования.
			 */
			onSchemaBuild: function(viewModelClass, schemaView, schema) {
				this.schemaView = schemaView;
				var viewModel = this.viewModel = designViewModel.create("DesignViewModel", viewModelClass, Ext);
				var cloneSchema = this.Terrasoft.deepClone(schema);
				if (Ext.isEmpty(cloneSchema.entitySchemaName)) {
					var viewModelPrototype = viewModelClass.prototype;
					cloneSchema.entitySchemaName = viewModelPrototype.entitySchemaName || "";
					cloneSchema.entitySchema = viewModelPrototype.entitySchema;
				}
				viewModel.init({
					sandbox: this.sandbox,
					schema: cloneSchema,
					header: schema.schemaCaption,
					viewModelClass: viewModelClass
				});
				this.initSchemaCaptionConverters(cloneSchema);
				viewModel.on("change:schema", this.onSchemaChange, this);
				viewModel.on("change:selectedItem", this.onSelectedItemChanged, this);
				viewModel.on("change", this.onChange, this);
			},

			/**
			 * Иницилизирует функци конвертера заголовков схемы.
			 * @private
			 * @param {Object} schema Схема карточки редактирования.
			 */
			initSchemaCaptionConverters: function(schema) {
				var viewConfigItems = schema.viewConfig[0].items;
				var header = this.viewModel.getSchemaItemInfoByName("Header", viewConfigItems);
				var tabs = this.viewModel.getSchemaItemInfoByName("Tabs", viewConfigItems);
				var headerItems = header.item.items;
				var tabsItems = tabs.item.tabs;
				this.initItemsCaptionConverters(headerItems);
				this.initItemsCaptionConverters(tabsItems);
			},

			/**
			 * Иницилизирует функцию конвертера заголовков элементов схемы
			 * @private
			 * @param {Object} items Элементы схемы.
			 */
			initItemsCaptionConverters: function(items) {
				Terrasoft.iterateChildItems(items, function(iterationConfig) {
					var itemCaptionConfig = iterationConfig.item.caption;
					if (itemCaptionConfig && itemCaptionConfig.bindConfig && itemCaptionConfig.bindConfig.converter) {
						var schema = this.viewModel.get("schema");
						var itemName = iterationConfig.item.name;
						var columnCaption = schema.entitySchema.columns[itemName].caption;
						this.viewModel[itemCaptionConfig.bindConfig.converter] = function(value) {
							value = value || columnCaption;
							return value + " (" + resources.localizableStrings.ConverterMessage + ")";
						};
					}
				}, this);
			},

			/**
			 * Возвращает конфигурационный объект верхней панели.
			 * @return{Object} Конфигурационный объект верхней панели.
			 */
			getHeaderConfig: function() {
				return {
					header: this.header
				};
			},

			/**
			 * Публикует сообщения для обновления верхней панели.
			 */
			updateHeader: function() {
				this.sandbox.publish("SetPageHeaderInfo", this.getHeaderConfig());
			},

			/**
			 * Функция инициализации модуля дизайнера
			 * @param {Function} callback Функция обратного вызова ядра. Выполнение функции означает завершение этапа
			 * инициализации.
			 * @param {Object} scope Контекст вызова callback-функции.
			 */
			init: function(callback, scope) {
				PageDesignerUtilities.getDetailsInfo(function() {
					var schemaName = this.getSchemaName();
					this.header = this.getHeader(schemaName);
					this.sandbox.subscribe("GetHeaderConfig", this.getHeaderConfig, this);
					this.updateHeader();
					schemaBuilder.build({
						schemaName: schemaName,
						useCache: false,
						profileKey: ""
					}, function(viewModelClass, schemaView, schema) {
						this.onSchemaBuild(viewModelClass, schemaView, schema);
						callback.call(scope);
					}, this);
				}, this);
				PageDesignerUtilities.setDataValueTypesStorage();
			},

			/**
			 * Функция рендеринга модуля дизайнера.
			 * @param {Ext.Element} renderTo Корневой элемент для рендеринга
			 */
			render: function(renderTo) {
				this.renderContainer = renderTo;
				this.renderSchema(this.schemaView);
				this.schemaView = null;
			}
		});

		return pageDesignerClass;
	});
