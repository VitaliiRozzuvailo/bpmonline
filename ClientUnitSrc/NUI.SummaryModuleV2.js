define("SummaryModuleV2", ["SummaryModuleV2Resources", "performancecountermanager"],
	function(resources, performanceCounterManager) {
		/**
		 * @class Terrasoft.configuration.SummaryModule
		 * Класс SummaryModule предназначен для создания экземпляра модуля итогов раздела
		 */
		Ext.define("Terrasoft.configuration.SummaryModule", {
			alternateClassName: "Terrasoft.SummaryModule",
			extend: "Terrasoft.BaseModule",

			Ext: null,
			sandbox: null,
			Terrasoft: null,

			/**
			 * Имя схемы, с которой работает модуль
			 * @private
			 */
			schemaName: null,

			/**
			 * Профиль
			 * @private
			 */
			profile: null,

			/**
			 * Ключ профиля
			 * @private
			 */
			profileKey: null,

			/**
			 * Флаг, который показывает, впервые ли загружаются итоги
			 * @private
			 */
			firstLoad: true,

			/**
			 * Идентификатор раздела
			 * @private
			 */
			sectionModuleId: null,

			/**
			 * Коллекция экземпляров итогов
			 * @private
			 */
			itemsCollection: new Terrasoft.Collection(),

			/**
			 * Выполняет отрисовку модуля контекстной справки
			 * @private
			 * @param {Object} renderTo контейнер в который отрисовывается модуль
			 */
			render: function render(renderTo) {
				if (this.destroyed || (this.Ext.isObject(renderTo) && !renderTo.dom)) {
					return;
				}
				var itemsCollection = this.itemsCollection;
				var firstLoad = this.firstLoad;
				this.schemaName = this.sandbox.publish("GetSectionSchemaName", null, [this.sandbox.id]);
				//TODO: Change for using hash if need use current module in custom module
				this.sectionModuleId = this.sandbox.publish("GetSectionModuleId");
				this.profileKey = "Section-" + this.schemaName + "-MainGrid-Summary";
				this.Terrasoft.require(["profile!" + this.profileKey], function(loadedProfile) {
					this.profile = loadedProfile;
					var view = this.Ext.create("Terrasoft.Container", this.generateView(renderTo));
					var summariesContainer = Ext.get("summariesContainer");
					var viewModel = this.Ext.create("Terrasoft.BaseViewModel", this.generateViewModel());
					var filters = this.sandbox.publish("GetFiltersCollection");
					if (filters) {
						this.addItemsFromProfile(summariesContainer, itemsCollection, filters);
						firstLoad = false;
					}
					view.bind(viewModel);
					this.sandbox.subscribe("FiltersChanged", function() {
						var renderTo = summariesContainer;
						var summariesCollection = itemsCollection;
						var filters = this.sandbox.publish("GetFiltersCollection");
						if (firstLoad) {
							this.addItemsFromProfile.call(this, renderTo, summariesCollection, filters);
							this.firstLoad = false;
						}
						else {
							this.updateSummaryItems.call(this, summariesCollection, filters);
						}
					}, this, [this.sectionModuleId]);
				}, this);
			},

			/**
			 * Создает запрос на основании профиля и фильтров
			 * и передает коллекцию элементов итогов в функцию callback
			 * @param profile
			 * @param filters
			 * @param callback
			 */
			getSummaries: function(filters, callback) {
				var select = this.Ext.create("Terrasoft.EntitySchemaQuery", {
						rootSchemaName: this.schemaName
					}
				);
				var count = this.profile.length;
				for (var i = 0; i < count; i++) {
					switch (this.profile[i][1]) {
						case "COUNT":
							select.addAggregationSchemaColumn(this.profile[i][0],
								this.Terrasoft.AggregationType.COUNT, this.profile[i][0] + this.profile[i][1]);
							break;
						case "SUM":
							select.addAggregationSchemaColumn(this.profile[i][0],
								this.Terrasoft.AggregationType.SUM, this.profile[i][0] + this.profile[i][1]);
							break;
						case "AVG":
							select.addAggregationSchemaColumn(this.profile[i][0],
								this.Terrasoft.AggregationType.AVG, this.profile[i][0] + this.profile[i][1]);
							break;
						case "MIN":
							select.addAggregationSchemaColumn(this.profile[i][0],
								this.Terrasoft.AggregationType.MIN, this.profile[i][0] + this.profile[i][1]);
							break;
						case "MAX":
							select.addAggregationSchemaColumn(this.profile[i][0],
								this.Terrasoft.AggregationType.MAX, this.profile[i][0] + this.profile[i][1]);
							break;
						default :
							break;
					}
				}
				if (filters && filters.collection.length > 0) {
					select.filters.add("quickFilter", filters);
				}
				select.getEntityCollection(callback, this);
			},

			/**
			 * Добавляет в коллекцию элементы итогов на основании профиля и фильтров
			 * @param renderTo
			 * @param itemsCollection
			 * @param filters
			 */
			addItemsFromProfile: function(renderTo, itemsCollection, filters) {
				var container = renderTo;
				if (this.profile && this.profile.length > 0) {
					this.getSummaries(filters,
						function(result) {
							var i = 0;
							var entities = result.collection.collection.items;
							var settingsList = this.profile;
							var itemsList = itemsCollection;
							itemsList.clear();
							this.Terrasoft.each(entities[0].values, function(value) {
								var count = itemsList.getCount();
								var key = "item_" + count;
								var viewModel = this.Ext.create("Terrasoft.BaseViewModel", this.generateViewModelItem());
								var view = this.Ext.create("Terrasoft.Container", this.generateViewItem(container, key));
								viewModel.key = key;
								viewModel.set("columnCaption", settingsList[i][2] + ": ");
								var columnDataValueType = entities[0].getColumnByName(settingsList[i][0] +
									settingsList[i][1]).dataValueType;
								value = this.Terrasoft.utils.getTypedStringValue(value, columnDataValueType);
								viewModel.set("columnValue", value);
								var me = this;
								viewModel.deleteItem = function() {
									var item = itemsList.removeByKey(this.key);
									item.view.destroy();
									this.destroy();
									me.saveDataToProfile(itemsList);
								};
								view.bind(viewModel);
								itemsList.add(key, {
									view: view,
									viewModel: viewModel,
									array: [settingsList[i][0], settingsList[i][1], settingsList[i][2],
										settingsList[i][3], settingsList[i][4]]
								});
								i++;
							}, this);
							performanceCounterManager.setTimeStamp("loadAdditionalModulesComplete");
						}
					);
				}
			},

			/**
			 * Сохраняет коллекцию итогов в профиль
			 * @param itemsList
			 */
			saveDataToProfile: function(itemsList) {
				var array = [];
				itemsList.each(function(item) {
					array.push([item.array[0], item.array[1], item.array[2], item.array[3], item.array[4]]);
				});
				this.profile = array;
				this.Terrasoft.utils.saveUserProfile(this.profileKey, this.profile, false);
			},

			/**
			 * Обновляет коллекцию элементов итогов на основании профиля и фильтров
			 * @param itemsCollection
			 * @param filters
			 */
			updateSummaryItems: function(itemsCollection, filters) {
				if (this.profile && this.profile.length > 0) {
					this.getSummaries(filters,
						function(result) {
							var i = 0;
							var entities = result.collection.collection.items;
							var settingsList = this.profile;
							var itemsList = itemsCollection;
							this.Terrasoft.each(entities[0].values, function(value) {
								var key = "item_" + i;
								var item = itemsList.get(key);
								var viewModel = item.viewModel;
								var columnDataValueType = entities[0].getColumnByName(settingsList[i][0] +
									settingsList[i][1]).dataValueType;
								value = this.Terrasoft.utils.getTypedStringValue(value, columnDataValueType);
								viewModel.set("columnValue", value);
								i++;
							}, this);
							performanceCounterManager.setTimeStamp("loadAdditionalModulesComplete");
						}
					);
				}
			},

			/**
			 * Генерирует представление элемента итогов
			 * @returns {Object}
			 */
			generateViewModelItem: function() {
				var viewModel = {
					values: {
						columnCaption: "",
						columnValue: ""
					},
					methods: {}
				};
				return viewModel;
			},

			/**
			 * Генерирует модель представления элемента итогов
			 * @returns {Object}
			 */
			generateViewModel: function() {
				var viewModel = {
					values: {
					},
					methods: {
					}
				};
				return viewModel;
			},

			/**
			 * Генерирует модель представление элемента итогов
			 * @param renderTo
			 * @param key
			 * @returns {Object}
			 */
			generateViewItem: function(renderTo, key) {
				var view = {
					renderTo: renderTo,
					id: "itemSummaryViewV2" + key,
					selectors: {
						el: "#itemSummaryViewV2" + key,
						wrapEl: "#itemSummaryViewV2" + key
					},
					classes: {
						wrapClassName: ["summary-item-container"]
					},
					items: [
						{
							className: "Terrasoft.Label",
							caption: {
								bindTo: "columnCaption"
							},
							classes: {
								labelClass: ["summary-item-caption"]
							},
							width: "auto"
						},
						{
							className: "Terrasoft.Label",
							caption: {
								bindTo: "columnValue"
							},
							classes: {
								labelClass: ["summary-item-value"]
							},
							width: "auto",
							markerValue: {
								bindTo: "columnCaption"
							}
						},
						{
							className: "Terrasoft.Button",
							style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
							imageConfig: resources.localizableImages.ImageDeleteButton,
							classes: {
								wrapperClass: ["summary-delete-button-wrapperEl"],
								imageClass: ["summary-delete-button-image-size"]
							},
							click: {
								bindTo: "deleteItem"
							},
							markerValue: {
								bindTo: "columnCaption"
							}
						}
					]
				};
				return view;
			},

			/**
			 * Генерирует представление элемента итогов
			 * @param renderTo
			 * @returns {Object}
			 */
			generateView: function(renderTo) {
				var view = {
					renderTo: renderTo,
					id: "summariesContainer",
					selectors: {
						wrapEl: "#summariesContainer"
					},
					classes: {
						wrapClassName: ["summaries-container"]
					},
					items: []
				};
				return view;
			},

			/**
			 * Очищает все подписки на события и уничтожает объект.
			 * @overridden
			 * @param {Object} config Параметры уничтожения модуля
			 */
			destroy: function(config) {
				if (this.destroyed) { return; }
				if (this.viewModel) {
					this.viewModel.destroy(config);
				}
			}
		});
		return Terrasoft.SummaryModule;
	});