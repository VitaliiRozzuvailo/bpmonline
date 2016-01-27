define("ContactCommunicationDetail", ["ContactCommunicationDetailResources", "terrasoft", "ViewUtilities", "Contact",
		"ConfigurationEnums", "ConfigurationConstants"],
	function(resources, Terrasoft, ViewUtilities, Contact, ConfigurationEnums, ConfigurationConstants) {
		return {
			entitySchemaName: "ContactCommunication",

			attributes: {

				/**
				 * Коллекция элементов меню "запрет на использование"
				 */
				RestrictionsMenuItems: {dataValueType: Terrasoft.DataValueType.COLLECTION},

				/**
				 * Коллекция запретов на использование
				 */
				RestrictionsCollection: {dataValueType: Terrasoft.DataValueType.COLLECTION}
			},
			methods: {
				/**
				 * Удаляет средство связи LinkedIn из пунктов меню.
				 * @param esq запрос средств связи.
				 */
				initCommunicationTypesFilters: function(esq) {
					this.callParent(arguments);
					var columns = Contact.columns;
					if (columns !== null) {
						if (columns.LinkedIn.usageType === ConfigurationEnums.EntitySchemaColumnUsageType.None) {
							var linkedInFilter = Terrasoft.createColumnFilterWithParameter(
								Terrasoft.ComparisonType.NOT_EQUAL, "Id", ConfigurationConstants.CommunicationTypes.LinkedIn);
							esq.filters.addItem(linkedInFilter);
						}
					}
				},

				/**
				 * Дополняет коллекцию меню кнопки детали "Добавить" элементами меню "запрет на использование".
				 * @overridden
				 * @return {Terrasoft.BaseViewModelCollection} Коллекция пунктов меню.
				 */
				getToolsMenuItems: function() {
					var menuItems = this.callParent(arguments);
					var restrictionsItem = this.getRestrictionsMenuItem();
					menuItems.addItem(restrictionsItem);
					return menuItems;
				},

				/**
				 * Возвращает пункт меню типа "запрет на изменение".
				 * @protected
				 * @return {Terrasoft.BaseViewModel} Модель представления пункта меню.
				 */
				getRestrictionsMenuItem: function() {
					var restrictionsMenuItems = Ext.create("Terrasoft.BaseViewModelCollection");
					var restrictionsItem = Ext.create("Terrasoft.BaseViewModel", {
						values: {
							Caption: this.get("Resources.Strings.DoNotUseCommunicationCaption"),
							Id: Terrasoft.utils.generateGUID(),
							Items: restrictionsMenuItems
						}
					});
					var restrictions = this.getRestrictions();
					Terrasoft.each(restrictions, function(restrictionConfig, restrictionName) {
						var restrictionMenuItem = this.Ext.create("Terrasoft.BaseViewModel", {
							values: {
								Id: Terrasoft.utils.generateGUID(),
								Caption: restrictionConfig.Caption,
								Tag: restrictionName,
								Click: { bindTo: "doNotUseCommunication" }
							}
						});
						restrictionsMenuItems.addItem(restrictionMenuItem);
					}, this);
					return restrictionsItem;
				},

				/**
				 * Возвращает запреты на использование.
				 * @protected
				 * @return {Object} Объект, который содержит свойства запретов на использование.
				 */
				getRestrictions: function() {
					return {
						"DoNotUseEmail": {
							"RestrictCaption": this.get("Resources.Strings.DoNotUseEmail"),
							"Caption": this.get("Resources.Strings.DoNotUseEmailCaption")
						},
						"DoNotUseCall": {
							"RestrictCaption": this.get("Resources.Strings.DoNotUseCall"),
							"Caption": this.get("Resources.Strings.DoNotUseCallCaption")
						},
						"DoNotUseSms": {
							"RestrictCaption": this.get("Resources.Strings.DoNotUseSms"),
							"Caption": this.get("Resources.Strings.DoNotUseSmsCaption")
						},
						"DoNotUseFax": {
							"RestrictCaption": this.get("Resources.Strings.DoNotUseFax"),
							"Caption": this.get("Resources.Strings.DoNotUseFaxCaption")
						},
						"DoNotUseMail": {
							"RestrictCaption": this.get("Resources.Strings.DoNotUseMail"),
							"Caption": this.get("Resources.Strings.DoNotUseMailCaption")
						}
					};
				},

				/**
				 * Обработчик событий пунктов меню запротов на использования средств связи.
				 * @protected
				 * @param {String} tag Идентификатор запрета на использование.
				 */
				doNotUseCommunication: function(tag) {
					if (this.get("IsDetailCollapsed")) {
						return;
					}
					var restrictions = this.getRestrictions();
					var collection = this.get("RestrictionsCollection");
					if (!collection.contains(tag)) {
						collection.add(tag, this.getRestrictionsCollectionItem(tag, restrictions[tag].RestrictCaption));
						this.changeCardPageButtonsVisibility(true);
					}
				},

				/**
				 * Возвращает конфигурацию представления элемента "запрет на использование"
				 * @protected
				 * @param {Object} itemConfig Ссылка на конфигурацию элемента в ContainerList.
				 * @param {Terrasoft.BaseViewModel} item Элемент, для которого сейчас происходит построение view.
				 */
				getRestrictionsItemConfig: function(itemConfig, item) {
					//todo: lazy init
					var config = ViewUtilities.getContainerConfig(
						"restrictions-container", ["restrictions-container-class", "control-width-15"]);
					itemConfig.config = config;
					var checkBoxLabelConfig = {
						className: "Terrasoft.Label",
						caption: {bindTo: "Name"},
						classes: {labelClass: ["detail-label-user-class"]},
						inputId: item.get("Id") + "-el"
					};
					var checkBoxEditConfig = {
						className: "Terrasoft.CheckBoxEdit",
						id: item.get("Id"),
						checked: {bindTo: "Value"}
					};
					config.items.push(checkBoxLabelConfig, checkBoxEditConfig);
				},

				/**
				 * Возвращает элемент коллекции "запрет на использование".
				 * @protected
				 * @param {String} id Идентификатор запрета на использование.
				 * @param {String} name Имя запрета на использование.
				 * @return {Terrasoft.BaseViewModel} Модель представления созданного элемента.
				 */
				getRestrictionsCollectionItem: function(id, name) {
					var collectionItem = Ext.create("Terrasoft.BaseViewModel", {
						values: {
							Name: name,
							Id: id,
							Value: true
						}
					});
					collectionItem.sandbox = this.sandbox;
					collectionItem.setSaveDiscardButtonsVisible = this.setSaveDiscardButtonsVisible;
					return collectionItem;
				},

				/**
				 * Загружает коллекцию "запрет на использование".
				 * @protected
				 * @param {Function} callback Функция обратного вызова.
				 * @param {Terrasoft.BaseSchemaViewModel} scope Контекст вызова функции обратного вызова.
				 */
				getEntityRestrictions: function(callback, scope) {
					if (this.get("IsDetailCollapsed")) {
						callback.call(scope);
						return;
					}
					var restrictions = ["DoNotUseEmail", "DoNotUseCall", "DoNotUseSms", "DoNotUseFax", "DoNotUseMail"];
					var select = this.Ext.create("Terrasoft.EntitySchemaQuery", {rootSchemaName: "Contact"});
					this.Terrasoft.each(restrictions, function(item) {
						select.addColumn(item);
					});
					select.getEntity(this.get("MasterRecordId"), function(response) {
						if (!response.success) {
							return;
						}
						if (response.entity) {
							var entity = response.entity;
							var collection = this.get("RestrictionsCollection");
							collection.clear();
							var newItemsCollection = this.Ext.create("Terrasoft.BaseViewModelCollection");
							this.Terrasoft.each(restrictions, function(restrictionName) {
								if (entity.get(restrictionName)) {
									var restrictionCaption = this.get("Resources.Strings." + restrictionName);
									var restrictionsCollectionItem =
										this.getRestrictionsCollectionItem(restrictionName, restrictionCaption);
									newItemsCollection.add(restrictionName, restrictionsCollectionItem);
								}
							}, this);
							collection.loadAll(newItemsCollection);
						}
						this.set("IsDataLoaded", true);
						callback.call(scope);
					}, this);
				},

				/**
				 * Обработчик изменения запрета на использование.
				 * @protected
				 */
				onRestrictionItemChanged: function() {
					if (this.get("IsDataLoaded")) {
						this.setSaveDiscardButtonsVisible(true);
					}
				},

				/**
				 * Инициирует загрузку запретов на использование.
				 * @overridden
				 * @param {Function} callback Функция обратного вызова.
				 * @param {Terrasoft.BaseSchemaViewModel} scope Контекст выполнения функции обратного вызова.
				 */
				loadContainerListData: function(callback, scope) {
					this.callParent([function() {
						this.set("IsDataLoaded", false);
						this.getEntityRestrictions(callback, scope);
					}, this]);
				},

				/**
				 * Инициализирует коллекцию запретов на использование.
				 * @overridden
				 */
				initCollections: function() {
					this.callParent(arguments);
					this.set("RestrictionsCollection", Ext.create("Terrasoft.BaseViewModelCollection"));
					var collection = this.get("RestrictionsCollection");
					collection.on("itemChanged", this.onRestrictionItemChanged, this);
				},

				/**
				 * Возвращает запрос на обновление запретов на использование.
				 * @protected
				 * @return {Terrasoft.UpdateQuery} Запрос на обновление запретов на использование.
				 */
				getSaveRestrictionsQuery: function() {
					var collection = this.get("RestrictionsCollection");
					if (collection.isEmpty()) {
						return null;
					}
					var update = Ext.create("Terrasoft.UpdateQuery", { rootSchemaName: "Contact" });
					update.enablePrimaryColumnFilter(this.get("MasterRecordId"));
					collection.each(function(item) {
						update.setParameterValue(item.get("Id"), item.get("Value"), Terrasoft.DataValueType.BOOLEAN);
					}, this);
					return update;
				},

				/**
				 * Сохраняет изменения детали. Срабатывает при нажатии на кнопку сохранить карточки, которая содержит
				 * деталь.
				 * @overridden
				 */
				save: function() {
					var restrictionsQuery = this.getSaveRestrictionsQuery();
					var queries = restrictionsQuery ? [restrictionsQuery] : [];
					var saveQueries = this.getSaveItemsQueries();
					queries = queries.concat(saveQueries);
					var deleteQueries = this.getDeleteItemsQueries();
					queries = queries.concat(deleteQueries);
					if (Ext.isEmpty(queries)) {
						this.publishSaveResponse({
							success: true
						});
						return true;
					}
					var batchQuery = Ext.create("Terrasoft.BatchQuery");
					Terrasoft.each(queries, function(query) {
						batchQuery.add(query);
					}, this);
					batchQuery.execute(this.onSaved, this);
					return true;
				}
			},

			diff: /**SCHEMA_DIFF*/[
				{
					"operation": "insert",
					"name": "RestrictionsContainer",
					"parentName": "Detail",
					"propertyName": "items",
					"values":
					{
						generator: "ConfigurationItemGenerator.generateContainerList",
						idProperty: "Id",
						collection: "RestrictionsCollection",
						observableRowNumber: 10,
						onGetItemConfig: "getRestrictionsItemConfig"
					}
				}
			]/**SCHEMA_DIFF*/
		};
	});