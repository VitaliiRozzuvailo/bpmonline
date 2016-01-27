// D9 Team
define("ProductCatalogueLevelSectionV2", ["LocalizableHelper", "ServiceHelper"],
	function(LocalizableHelper, ServiceHelper) {
		return {
			entitySchemaName: "ProductCatalogueLevel",
			messages: {
				/**
				 * @message GetBackHistoryState
				 * Получает путь, куда переходить после нажатия на кнопку закрыть
				 */
				"GetBackHistoryState": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				}
			},
			methods: {

				/**
				 * Инициализация страницы раздела
				 * @protected
				 * @overriden
				 */
				init: function() {
					this.callParent(arguments);
					var backHistoryState = this.sandbox.publish("GetBackHistoryState",
						null, ["ProductCatalogueLevelSectionV2"]);
					this.set("BackHistoryState", backHistoryState || null);
				},

				/**
				 * Определяет видимость кнопки "Закрыть" по наличию пути для обратного перехода
				 * @returns {boolean} true, если кнопка видима
				 */
				isCloseButtonVisible: function() {
					return (this.get("BackHistoryState") != null);
				},

				/**
				 * Возвращает представления раздела по умолчанию.
				 * Реестр, Аналитика
				 * @protected
				 * @return {Object} Представления раздела по умолчанию.
				 */
				getDefaultDataViews: function() {
					var gridDataView = {
						name: "GridDataView",
						active: true,
						caption: this.getDefaultGridDataViewCaption(),
						icon: this.getDefaultGridDataViewIcon()
					};
					return {
						"GridDataView": gridDataView
					};
				},

				/**
				 * Устанавливаем заголовок страницы.
				 * @overriden
				 * @returns {string}
				 */
				getDefaultGridDataViewCaption: function() {
					return this.get("Resources.Strings.HeaderCaption");
				},

				/**
				 * Настройка кнопки отображения групп.
				 * Скрывает кнопку отображения групп.
				 * @overriden
				 */
				initSeparateModeActionsButtonHeaderMenuItemCaption: function() {
					this.set("SeparateModeActionsButtonHeaderMenuItemCaption",
						this.get("Resources.Strings.ShortHeaderCaption"));
					this.set("IsIncludeInFolderButtonVisible", false);
				},

				/**
				 * Метод выполняет действия над выделенной строкой в завистимости от tag.
				 * @private
				 */
				onActiveRowAction: function(tag, id) {
					if (tag === "delete" || tag === "edit") {
						this.callParent(arguments);
					} else {
						var gridData = this.getGridData();
						var activeRow = gridData.get(id);
						var position = activeRow.get("Position");
						if (tag === "up") {
							if (position > 0) {
								position--;
							}
						}
						if (tag === "down") {
							position++;
						}
						this.setPosition(id, position, function() {
							gridData.clear();
							this.loadGridData();
						}, this);
					}
				},

				/**
				 * Получает колонки, которые всегда выбираются запросом.
				 * @protected
				 * @overridden
				 * @return {Object} Возвращает колонки, которые всегда выбираются запросом.
				 */
				getGridDataColumns: function() {
					var gridDataColumns = this.callParent(arguments);
					if (gridDataColumns && !gridDataColumns.Position) {
						gridDataColumns.Position = {
							path: "Position",
							orderPosition: 0,
							orderDirection: Terrasoft.OrderDirection.ASC
						};
					}
					return gridDataColumns;
				},

				/**
				 * Метод устанавливает сортировку значений колонки position.
				 * @private
				 * @param string recordId Идентификатор записи.
				 * @param int position Новая позиция.
				 * @param function callback Функция обратного вызова.
				 * @param Object scope Контекст выполнения callback.
				 */
				setPosition: function(recordId, position, callback, scope) {
					var data = {
						tableName: this.entitySchemaName,
						primaryColumnValue: recordId,
						position: position,
						grouppingColumnNames: ""
					};
					ServiceHelper.callService("RightsService", "SetCustomRecordPosition", callback, data, scope);
				},

				/**
				 * Возвращает пустую коллекцию действий раздела в режиме отображения реестра.
				 * @protected
				 * @overridden
				 * @return {Terrasoft.BaseViewModelCollection} Возвращает коллекцию действий раздела в режиме
				 * отображения реестра.
				 */
				getSectionActions: function() {
					var actionMenuItems = this.callParent(arguments);
					actionMenuItems.clear();
					return actionMenuItems;
				},

				/**
				 * Инициализация подписка на сообщение сохранения страницы редактирования.
				 * @protected
				 * @overriden
				 */
				initCardModuleResponseSubscription: function() {
					var editCardsSandboxIds = [];
					var editPages = this.get("EditPages");
					editPages.each(function(editPage) {
						var editCardsSandboxId = this.getChainCardModuleSandboxId(editPage.get("Tag"));
						editCardsSandboxIds.push(editCardsSandboxId);
					}, this);
					editCardsSandboxIds.push(this.getCardModuleSandboxId());
					this.sandbox.subscribe("CardModuleResponse", function() {
						var gridData = this.getGridData();
						gridData.clear();
						this.loadGridData();
					}, this, editCardsSandboxIds);
				},

				/**
				 * Обработчик клика по кнопке "Закрыть". Переход на предыдущую страницу
				 * @protected
				 */
				onCloseCatalogueButtonClick: function() {
					var backHistoryState = this.get("BackHistoryState");
					this.sandbox.publish("ReplaceHistoryState",
						{
							hash: backHistoryState
						});
				}

			},
			diff: /**SCHEMA_DIFF*/[
				{
					"operation": "merge",
					"name": "DataGrid",
					"values": {
						"activeRowAction": { "bindTo": "onActiveRowAction"},
						"type": "tiled",
						"listedConfig": {
							"name": "DataGridListedConfig",
							"items": [
								{
									"name": "NameListedGridColumn",
									"bindTo": "Name",
									"type": Terrasoft.GridCellType.TEXT,
									"position": { "column": 1, "colSpan": 14 }
								}
							]
						},
						"tiledConfig": {
							"name": "DataGridTiledConfig",
							"grid": { "columns": 24, "rows": 1},
							"items": [
								{
									"name": "NameTiledGridColumn",
									"bindTo": "Name",
									"type": Terrasoft.GridCellType.TEXT,
									"position": { "row": 1, "column": 1, "colSpan": 10 },
									"captionConfig": { "visible": false }
								}
							]
						}
					}
				},
				{
					"operation": "insert",
					"name": "DataGridActiveRowMoveUpAction",
					"parentName": "DataGrid",
					"propertyName": "activeRowActions",
					"values": {
						"className": "Terrasoft.Button",
						"style": Terrasoft.controls.ButtonEnums.style.BLUE,
						"imageConfig": LocalizableHelper.localizableImages.Up,
						"tag": "up"
					}
				},
				{
					"operation": "insert",
					"name": "DataGridActiveRowMoveDownAction",
					"parentName": "DataGrid",
					"propertyName": "activeRowActions",
					"values": {
						"className": "Terrasoft.Button",
						"style": Terrasoft.controls.ButtonEnums.style.BLUE,
						"imageConfig": LocalizableHelper.localizableImages.Down,
						"tag": "down"
					}
				},
				{
					"operation": "remove",
					"name": "DataGridActiveRowCopyAction"
				},
				{
					"operation": "remove",
					"name": "SeparateModePrintButton"
				},
				{
					"operation": "remove",
					"name": "SeparateModeViewOptionsButton"
				},
				{
					"operation": "merge",
					"name": "DataGridActiveRowOpenAction",
					"parentName": "DataGrid",
					"propertyName": "activeRowActions",
					"values": {
						"style": Terrasoft.controls.ButtonEnums.style.GREY
					}
				},
				{
					"operation": "remove",
					"name": "CombinedModePrintButton"
				},
				{
					"operation": "remove",
					"name": "CombinedModeViewOptionsButton"
				},
				{
					"operation": "insert",
					"name": "CloseCatalogueButton",
					"parentName": "SeparateModeActionButtonsLeftContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"caption": { "bindTo": "Resources.Strings.CloseButtonCaption" },
						"visible": { "bindTo" : "isCloseButtonVisible" },
						"click": { "bindTo": "onCloseCatalogueButtonClick" },
						"classes": {
							"textClass": ["actions-button-margin-right"],
							"wrapperClass": ["actions-button-margin-right"]
						}
					}
				}
			]/**SCHEMA_DIFF*/
		};
	});