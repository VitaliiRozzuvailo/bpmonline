define("SysAdminOperationPageV2",
	["SysAdminOperationPageV2Resources"],
	function() {
		return {
			entitySchemaName: "SysAdminOperation",
			details: /**SCHEMA_DETAILS*/{
				DetailOperation: {
					"schemaName": "SysAdminOperationGranteeDetailV2",
					"filter": {
						"masterColumn": "Id",
						"detailColumn": "SysAdminOperation"
					}
				}
			}/**SCHEMA_DETAILS*/,
			diff: /**SCHEMA_DIFF*/[
				{
					"operation": "insert",
					"name": "Name",
					"parentName": "Header",
					"propertyName": "items",
					"values": {
						"layout": { "column": 0, "row": 0, "colSpan": 12 }
					}
				},
				{
					"operation": "insert",
					"name": "Code",
					"parentName": "Header",
					"propertyName": "items",
					"values": {
						"layout": { "column": 12, "row": 0, "colSpan": 12 },
						"enabled": {"bindTo": "isAddMode"}
					}
				},
				{
					"operation": "insert",
					"name": "Description",
					"parentName": "Header",
					"propertyName": "items",
					"values": {
						"layout": { "column": 0, "row": 1, "colSpan": 12 },
						"contentType": this.Terrasoft.ContentType.LONG_TEXT
					}
				},
				{
					"operation": "insert",
					"name": "DetailOperation",
					"parentName": "HistoryTabContainer",
					"propertyName": "items",
					"values": { "itemType": this.Terrasoft.ViewItemType.DETAIL }
				}
			]/**SCHEMA_DIFF*/,
			methods: {

				/**
				 * @inheritdoc BasePageV2#addSectionDesignerViewOptions
				 * @overridden
				 */
				addSectionDesignerViewOptions: this.Terrasoft.emptyFn,

				/**
				 * Скрывает пункты меню кнопки "Действия".
				 * @inheritdoc BasePageV2#initActionButtonMenu
				 * @overridden
				 */
				initActionButtonMenu: this.Terrasoft.emptyFn,
				/**
				 * Скрывает пункты меню кнопки "Запустить процесс".
				 * @inheritdoc ProcessEntryPointUtilities#initRunProcessButtonMenu
				 * @overridden
				 */
				initRunProcessButtonMenu: this.Terrasoft.emptyFn,

				/**
				 * Сохраняет или обновляет операцию в БД.
				 * @inheritdoc BasePageV2#saveEntity
				 */
				saveEntity: function(callback, scope) {
					var config = {
						"serviceName": "RightsService",
						"methodName": "UpsertAdminOperation",
						"data": {
							"recordId": this.get("Id"),
							"name": this.get("Name"),
							"code": this.get("Code"),
							"description": this.get("Description")
						}
					};
					this.callService(config, this.onGetResponse.bind(undefined, callback, scope), this);
				},

				/**
				 * Получает ответ от сервиса и дополняет его.
				 * @param callback {Function} Функция обратного вызова.
				 * @param scope {Object} Контекст callback-функции.
				 * @param response {Object} Ответ от сервиса.
				 * @private
				 */
				onGetResponse: function(callback, scope, response) {
					if (response && response.UpsertAdminOperationResult) {
						var result = this.Ext.decode(response.UpsertAdminOperationResult);
						if (result && !this.Ext.isEmpty(result)) {
							response.success = result.Success;
							response.message = result.ExMessage;
							response.rowsAffected = 1;
							response.nextPrcElReady = false;
							scope.isNew = false;
							scope.changedValues = null;
							callback.call(scope || this, response);
						}
					}
				}
			}
		};
	});
