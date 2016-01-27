define("EmailDetailV2", ["terrasoft", "ProcessModuleUtilities"],
		function(Terrasoft, ProcessModuleUtilities) {
			return {
				/**
				 * Имя схемы объекта
				 * @type {String}
				 */
				entitySchemaName: "Activity",

				messages: {
					/**
					 * @message ProcessExecDataChanged
					 * Определяет что нужно передать данные выполения процесса
					 * @param {Object}
					 *		procElUId: идинтификатор эелемента процесса,
					 *		recordId: идинтификатор записи,
					 *		scope: контекст,
					 *		parentMethodArguments: агументы бля родительского метода,
					 *		parentMethod: родительский метод
					 */
					"ProcessExecDataChanged": {
						mode: Terrasoft.MessageMode.PTP,
						direction: Terrasoft.MessageDirectionType.PUBLISH
					}
				},
				attributes: {
				},
				methods: {
					/**
					 * Если это активность открытая в БП открываем ее в карточке по процессу
					 * @return {boolean} Открыта ли карточка редактирования
					 * @private
					 **/
					tryOpenProcessCard: function(activeRow) {
						var gridData = this.getGridData();
						activeRow = activeRow || this.get("ActiveRow");
						if (activeRow) {
							var prcElId = gridData.get(activeRow).get("ProcessElementId");
							var recordId = gridData.get(activeRow).get(this.primaryColumnName);
							return (ProcessModuleUtilities.tryShowProcessCard.call(this, prcElId, recordId));
						}
						return false;
					},

					/**
					 * Открыть страницу редактирования, если это не техническая активность,
					 * иначе открыть карточку активности.
					 * @param {Object} record (optional) Модель записи, которая будет открыта для редактирования,
					 * в случае если в реестре детали нет активной строки.
					 * @overridden
					 **/
					editRecord: function(record) {
						var activeRow = null;
						if (!this.Ext.isEmpty(record)) {
							activeRow = record.get(record.primaryColumnName);
						}
						if (this.tryOpenProcessCard(activeRow)) {
							return true;
						}
						this.callParent(arguments);
					},

					/**
					 * @overridden
					 */
					getGridDataColumns: function() {
						var gridDataColumns = this.callParent(arguments);
						if (!gridDataColumns.ProcessElementId) {
							gridDataColumns.ProcessElementId = {
								path: "ProcessElementId"
							};
						}
						return gridDataColumns;
					},
					linkClicked: function(href, columnName) {
						if (columnName !== this.primaryDisplayColumnName &&
								columnName !== ("on" + this.primaryDisplayColumnName + "LinkClick")) {
							return this.callParent(arguments);
						}
						var linkParams = href.split("/");
						var recordId = linkParams[linkParams.length - 1];
						if (this.tryOpenProcessCard(recordId)) {
							return false;
						}
						return this.callParent(arguments);
					},

					/**
					 * Возвращает имя колонки для фильтрации по умолчанию.
					 * @overridden
					 * @return {String} Имя колонки.
					 */
					getFilterDefaultColumnName: function() {
						return "Title";
					},

					/**
					 * Инициализирует коллекцию страниц редактирования сущности.
					 * @overridden
					 */
					initEditPages: function () {
						var collection = Ext.create("Terrasoft.BaseViewModelCollection");
						var entityStructure = this.getEntityStructure(this.entitySchemaName);
						if (entityStructure) {
							Terrasoft.each(entityStructure.pages, function(editPage) {
								var typeUId = editPage.UId || Terrasoft.GUID_EMPTY;
								if (editPage.cardSchema === "EmailPageV2"){
									collection.add(typeUId, Ext.create("Terrasoft.BaseViewModel", {
										values: {
											Id: typeUId,
											Caption: editPage.caption,
											Click: {bindTo: "addRecord"},
											Tag: typeUId,
											SchemaName: editPage.cardSchema
										}
									}));
								}
							}, this);
						}
						this.set("EditPages", collection);
					}
				},

				diff: /**SCHEMA_DIFF*/[
					{
						"operation": "merge",
						"name": "DataGrid",
						"values": {
							type: "listed",
							listedConfig: {
								name: "DataGridListedConfig",
								items: [
									{
										name: "TitleListedGridColumn",
										bindTo: "Title",
										type: Terrasoft.GridCellType.TEXT,
										position: {
											column: 1,
											colSpan: 12
										}
									},
									{
										name: "StartDateListedGridColumn",
										bindTo: "StartDate",
										type: Terrasoft.GridCellType.TEXT,
										position: {
											column: 13,
											colSpan: 6
										}
									},
									{
										name: "StatusDateListedGridColumn",
										bindTo: "Status",
										type: Terrasoft.GridCellType.TEXT,
										position: {
											column: 19,
											colSpan: 6
										}
									}
								]
							},
							tiledConfig: {
								name: "DataGridTiledConfig",
								grid: {columns: 24, rows: 3},
								items: [
									{
										name: "TitleTiledGridColumn",
										bindTo: "Title",
										type: Terrasoft.GridCellType.TEXT,
										position: {
											row: 1,
											column: 1,
											colSpan: 24
										},
										captionConfig: {
											visible: true
										}
									},
									{
										name: "StartDateTiledGridColumn",
										bindTo: "StartDate",
										type: Terrasoft.GridCellType.TEXT,
										position: {
											row: 2,
											column: 1,
											colSpan: 6
										}
									},
									{
										name: "OwnerTiledGridColumn",
										bindTo: "Owner",
										type: Terrasoft.GridCellType.Text,
										position: {
											row: 2,
											column: 7,
											colSpan: 12
										}
									},
									{
										name: "StatusDateTiledGridColumn",
										bindTo: "Status",
										type: Terrasoft.GridCellType.TEXT,
										position: {
											column: 19,
											colSpan: 6
										}
									}
								]
							}
						}
					}
				]/**SCHEMA_DIFF*/
			};
		}
);