define("TagUtilitiesV2", ["terrasoft", "MaskHelper", "ModalBox", "TagConstantsV2"],
	function(Terrasoft, MaskHelper, ModalBox, TagConstants) {
		/**
		 * @class Terrasoft.configuration.mixins.TagUtilities
		 * Миксин, реализующий работу модуля тегов в разделах и карточках редактирования.
		 */
		Ext.define("Terrasoft.configuration.mixins.TagUtilities", {
			alternateClassName: "Terrasoft.TagUtilities",

			modalBoxContainer: null,

			/**
			 * Название схемы тегов раздела
			 * @Type {string}
			 */
			tagSchemaName: null,

			/**
			 * Название схемы тегов в записи раздела
			 * @Type {string}
			 */
			inTagSchemaName: null,

			modalBoxSize: {
				minHeight: "1",
				minWidth: "1",
				maxHeight: "100",
				maxWidth: "100"
			},

			/**
			 * Возвращает фиксированный контейнер в модальном окне.
			 * @protected
			 * @return {Object}
			 */
			getFixedHeaderContainer: function() {
				return ModalBox.getFixedBox();
			},

			/**
			 * Возвращает основной контейнер в модальном окне.
			 * @protected
			 * @return {Object}
			 */
			getGridContainer: function() {
				return this.modalBoxContainer;
			},

			/**
			 * Возвращает фильтр по автору тегов (для личных) и по остальным тегам.
			 * @private
			 * @return {Terrasoft.FilterGroup}
			 */
			getCurrentUserAndTypesFilter: function() {
				var filterGroup = new this.Terrasoft.createFilterGroup();
				filterGroup.logicalOperation = this.Terrasoft.LogicalOperatorType.OR;
				var innerFilterGroupCreatedBy = new this.Terrasoft.createFilterGroup();
				innerFilterGroupCreatedBy.add("CurrentUser", this.Terrasoft.createColumnFilterWithParameter(
					this.Terrasoft.ComparisonType.EQUAL, "Tag.CreatedBy", this.Terrasoft.SysValue.CURRENT_USER_CONTACT.value));
				innerFilterGroupCreatedBy.add("PrivateType", this.Terrasoft.createColumnFilterWithParameter(
					this.Terrasoft.ComparisonType.EQUAL, "Tag.Type", TagConstants.TagType.Private));
				var innerFilterGroupOtherTypes = new this.Terrasoft.createFilterGroup();
				var types = [TagConstants.TagType.Corporate, TagConstants.TagType.Public];
				innerFilterGroupOtherTypes.add("OtherTypes", this.Terrasoft.createColumnInFilterWithParameters(
					"Tag.Type", types));
				filterGroup.addItem(innerFilterGroupCreatedBy);
				filterGroup.addItem(innerFilterGroupOtherTypes);
				return filterGroup;
			},

			/**
			 * Обновляет размеры окна в соответствии с контентом.
			 * @public
			 */
			updateSize: function() {
				ModalBox.updateSizeByContent();
			},

			/**
			 * Подготавливает модальное окно для загрузки туда модуля тегов.
			 * @private
			 */
			prepareModalBox: function() {
				this.modalBoxContainer = ModalBox.show(this.modalBoxSize);
				ModalBox.setSize(1, 1);
			},

			/**
			 * Закрывает модальное окно Lookup-а и выгружает модуль.
			 * @public
			 */
			closeModalBox: function() {
				if (this.modalBoxContainer) {
					ModalBox.close();
					this.modalBoxContainer = null;
				}
			},

			/**
			 * Формирует id загружаемого модуля тегов.
			 * @protected
			 * @param {object} sandbox
			 * @return {string} id модуля
			 */
			getTagModulePageId: function(sandbox) {
				return sandbox.id + "_TagModule";
			},

			/**
			 * Открывает модуль тегов
			 * @protected
			 * @param {object} config конфиг модуля
			 */
			openTagModule: function(config) {
				var scope = config.scope;
				var sandbox = config.sandbox || scope.sandbox;
				var tagModulePageId = this.getTagModulePageId(sandbox);
				this.prepareModalBox();
				var tagModuleConfig = {
					renderTo: this.getGridContainer(),
					id: tagModulePageId,
					parameters: {
						TagSchemaName: config.entityTagSchemaName,
						InTagSchemaName: config.entityInTagSchemaName,
						RecordId: config.entityRecordId
					}
				};
				sandbox.loadModule("TagModule", tagModuleConfig);
			},

			/**
			 * Обновляет заголовок кнопки тегов (количество тегов на записи).
			 * @protected
			 * @param {string} recordId - идентификатор записи
			 */
			reloadTagCount: function(recordId) {
				if (recordId) {
					this.initTagButtonCaption(recordId);
				} else {
					this.initTagButtonCaption();
				}
			},

			/**
			 * Выполняет проверку наличия схем тегов для раздела.
			 * @param {String} schemaName название схемы объекта раздела
			 * @protected
			 */
			initTags: function(schemaName) {
				if (this.get("UseTagModule")) {
					this.checkSchemaExists((this.inTagSchemaName || (schemaName + "InTag")), function(schemaName) {
						if (schemaName !== null) {
							this.set("TagButtonVisible", true);
						} else {
							this.set("TagButtonVisible", false);
						}
					});
				} else {
					this.set("TagButtonVisible", false);
				}
			},

			/**
			 * Иницииализирует кнопку тегов.
			 * @protected
			 */
			initTagButton: function() {
				if (this.get("UseTagModule") && this.get("TagButtonVisible")) {
					this.initTagButtonCaption();
				}
			},

			/**
			 * Инициализирует заголовок кнопки (количество тегов в записи).
			 * @protected
			 * @param {String} primaryColumnValue  идентификатор записи
			 */
			initTagButtonCaption: function(primaryColumnValue) {
				if (this.get("TagButtonVisible")) {
					var recordId = null;
					if (!primaryColumnValue) {
						recordId = this.getCurrentRecordId();
					} else {
						recordId = primaryColumnValue;
					}
					if (recordId && recordId !== null && !this.Ext.isArray(recordId)) {
						var esq = Ext.create("Terrasoft.EntitySchemaQuery", {
							rootSchemaName: (this.inTagSchemaName) || (this.entitySchemaName + "InTag")
						});
						esq.addColumn("Tag");
						var filter = this.getCurrentUserAndTypesFilter();
						var filterGroup = this.Ext.create("Terrasoft.FilterGroup");
						filterGroup.addItem(this.Terrasoft.createColumnFilterWithParameter(this.Terrasoft.ComparisonType.EQUAL,
							"Entity", recordId));
						filterGroup.addItem(filter);
						esq.filters.add(filterGroup);
						esq.getEntityCollection(function(result) {
							if (result.success) {
								var collection = result.collection;
								if (collection) {
									if (collection.getCount() > 0) {
										this.set("TagButtonCaption", collection.getCount());
									} else {
										this.set("TagButtonCaption", "");
									}
								}
							}
						}, this);
					} else {
						this.set("TagButtonCaption", "");
					}
				}
			},

			/**
			 * Проверяет наличие объекта для работы тегов.
			 * @protected
			 * @param {string} name название объекта
			 * @param {Function} callback функция-callback
			 */
			checkSchemaExists: function(name, callback) {
				this.Terrasoft.EntitySchemaManager.initialize(function() {
					var item = this.Terrasoft.EntitySchemaManager.getItems()
						.filterByFn(function(item) {
							return item.name === name;
						})
						.getByIndex(0);
					callback.call(this, (item && item.name) || null);
				}, this);
			},

			/**
			 * Обработчик кнопки "Тег".
			 * @protected
			 */
			onTagButtonClick: function() {
				this.showTagModule();
			},

			/**
			 * Сохраняет запись, если она изменена,
			 * и отправляет событие в раздел о необходимости открыть модуль тегов.
			 * @protected
			 */
			saveCardAndLoadTagsFromSection: function() {
				if (this.isChanged()) {
					var config = {
						callback: this.publishSectionMessage,
						isSilent: true,
						callBaseSilentSavedActions: true
					};
					this.save(config);
				} else {
					this.publishSectionMessage();
				}
			},

			/**
			 * Отправляет сообщение в раздел о необходимости открыть модуль тегов.
			 * @protected
			 */
			publishSectionMessage: function() {
				this.sandbox.publish("CardChanged", {
					key: "CanShowTags",
					value: true
				}, [this.sandbox.id]);
			},

			/**
			 * Выполняет сохранение записи перед открытием модуля тегов.
			 * @protected
			 */
			saveCardAndLoadTags: function() {
				if (this.isChanged()) {
					var config = {
						callback: this.showTagModule,
						isSilent: true,
						callBaseSilentSavedActions: true
					};
					this.save(config);
				} else {
					this.showTagModule();
				}
			},

			/**
			 * Отображает модуль тегов.
			 * @protected
			 */
			showTagModule: function() {
				var config = {
					scope: this,
					sandbox: this.sandbox,
					entityTagSchemaName: (this.tagSchemaName) || (this.entitySchemaName + "Tag"),
					entityInTagSchemaName: (this.inTagSchemaName) || (this.entitySchemaName + "InTag"),
					entityRecordId: this.getCurrentRecordId()
				};
				this.openTagModule(config);
			},

			/**
			 * Возвращает идентификатор текущей активной записи.
			 * @virtual
			 * @protected
			 */
			getCurrentRecordId: this.Terrasoft.emptyFn
		});
	}
);