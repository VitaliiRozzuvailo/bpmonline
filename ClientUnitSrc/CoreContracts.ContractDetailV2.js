define("ContractDetailV2", ["terrasoft", "ConfigurationEnums", "BusinessRuleModule"],
function(Terrasoft, enums) {
	return {
		entitySchemaName: "Contract",
		attributes: {},
		messages: {
			/**
			 * @message CardModuleResponse
			 * Возвращает информацию о сохранении карточки.
			 * @param {Object} Конфигурация сохраняемой карточки.
			 */
			"CardModuleResponse": {
				mode: Terrasoft.MessageMode.PTP,
				direction: Terrasoft.MessageDirectionType.SUBSCRIBE
			}
		},
		methods: {

			/**
			 * @inheritdoc Terrasoft.BaseGridDetailV2#subscribeSandboxEvents
			 * @overridden
			 */
			subscribeSandboxEvents: function() {
				this.callParent(arguments);
				var cardModuleId = this.getMasterPageSandboxId() + "_ContractEdit";
				this.sandbox.subscribe("CardModuleResponse", function(config) {
					if (this.destroyed) {
						return;
					}
					this.loadGridDataRecord(config.primaryColumnValue);
				}, this, [cardModuleId]);
			},

			/**
			 * Получает идентификатор модуля родительской страницы.
			 */
			getMasterPageSandboxId: function() {
				return this.sandbox.id.replace("_detail_ContractContract", "");
			},

			/**
			 * Отправляет сообщение на сохранение родительской страницы редактирования и инициирует вызов
			 * открытия справочника документов для связи с договором
			 * @private
			 */
			linkWithExisting: function() {
				var editPages = this.get("EditPages");
				if (editPages.getCount() === 0) {
					return;
				}
				var editPage = editPages.getByIndex(0);
				var editPageUId = editPage.get("Tag");
				var cardState = this.sandbox.publish("GetCardState", null, [this.sandbox.id]);
				var isNew = (cardState.state === enums.CardStateV2.ADD ||
				cardState.state === enums.CardStateV2.COPY);
				if (isNew) {
					this.set("CardState", enums.CardStateV2.ADD);
					this.set("EditPageUId", editPageUId);
					var scope = this;
					var args = {
						isSilent: true,
						callback: function() {
							scope.openContractLookupToLink();
						},
						messageTags: [this.sandbox.id]
					};
					this.sandbox.publish("SaveRecord", args, [this.sandbox.id]);
				} else {
					this.openContractLookupToLink();
				}
			},
			/**
			 * Фильтрует справочник документов для выбора записей,
			 * которые необходимо связать с текущим договором.
			 * @private
			 */
			getLookupFilters: function() {
				var config = {
					entitySchemaName: "Contract",
					multiSelect: true,
					columns: ["Number", "Account", "Type", "State"]
				};
				var filterGroup = this.Terrasoft.createFilterGroup();
				var defaultValues = this.get("DefaultValues");
				var existsFilterGroup = this.Terrasoft.createFilterGroup();
				existsFilterGroup.addItem(this.Terrasoft.createColumnFilterWithParameter(
					this.Terrasoft.ComparisonType.EQUAL, "Parent", this.get("MasterRecordId")));
				var existsFilter = this.Terrasoft.createNotExistsFilter("Id", existsFilterGroup);
				filterGroup.addItem(existsFilter);
				var filterGroupNull = this.Terrasoft.createFilterGroup();
				filterGroupNull.logicalOperation = this.Terrasoft.LogicalOperatorType.OR;
				filterGroupNull.addItem(this.Terrasoft.createColumnFilterWithParameter(
						Terrasoft.ComparisonType.NOT_EQUAL, "Parent", this.get("MasterRecordId")));
				filterGroupNull.addItem(this.Terrasoft.createColumnIsNullFilter("Parent"));
				filterGroup.addItem(filterGroupNull);
				filterGroup.addItem(this.Terrasoft.createColumnFilterWithParameter(
					Terrasoft.ComparisonType.NOT_EQUAL, "Id", this.get("MasterRecordId")));
				if (defaultValues) {
					this.Terrasoft.each(defaultValues, function(defValue) {
						if (defValue.name === "Account" || defValue.name === "OurCompany") {
							filterGroup.addItem(this.Terrasoft.createColumnFilterWithParameter(
								Terrasoft.ComparisonType.EQUAL, defValue.name, defValue.value));
						}
					}, this);
				}
				config.filters = filterGroup;
				return config;
			},
			/**
			 * Открывает справочник документов для выбора записей,
			 * которые необходимо связать с текущим договором.
			 * @private
			 */
			openContractLookupToLink: function() {
				var config = this.getLookupFilters();
				this.openLookup(config, this.linkSelectedRecords, this);
			},
			/**
			 * Добавляет связи для выбранных записей с родительским договором.
			 * Производит подсчет добавленных записей и в конце генерирует сообщение,
			 * сколько договоров было добавлено по сравнению с выбранными.
			 * @param {Object} args Объект вида {columnName: string, selectedRows: []}.
			 * Содержит массив выбранных записей из справочника.
			 * @private
			 */
			linkSelectedRecords: function(args) {
				var selectedRows = args.selectedRows.getItems();
				var totalCount = selectedRows.length;
				var addedCount = 0;
				var callsCount = 0;
				this.Terrasoft.each(selectedRows, function(item) {
					callsCount++;
					var update = this.Ext.create("Terrasoft.UpdateQuery", {
						rootSchemaName: "Contract"
					});
					update.enablePrimaryColumnFilter(item.value);
					update.setParameterValue("Parent", this.get("MasterRecordId"), this.Terrasoft.DataValueType.GUID);
					update.execute(function(response) {
						if (response && response.success) {
							addedCount++;
						}
						if (callsCount === totalCount) {
							var resultMessage =
								this.Ext.String.format(this.get("Resources.Strings.AddedLinksCountMessage"),
									addedCount, totalCount);
							this.Terrasoft.showInformation(resultMessage);
							this.reloadGridData();
						}
					}, this);
				}, this);
			},
			/**
			 * Удаляет связь подчиненного договора с текущим родителем.
			 * @private
			 */
			deleteLinkWithContracts: function() {
				this.showBodyMask();
				var selectedRows = this.getSelectedItems();
				var update = this.Ext.create("Terrasoft.UpdateQuery", {
					rootSchemaName: "Contract"
				});
				update.filters.add("ContractsFilter",
					Terrasoft.createColumnInFilterWithParameters("Id", selectedRows));
				update.setParameterValue("Parent", null, this.Terrasoft.DataValueType.GUID);
				this.showConfirmationDialog(this.get("Resources.Strings.DeleteConfirmationMessage"),
					function(returnCode) {
						if (returnCode === this.Terrasoft.MessageBoxButtons.YES.returnCode) {
							update.execute(function() {
								this.hideBodyMask();
								this.set("ActiveRow", null);
								this.set("SelectedRow", null);
								this.reloadGridData();
							}, this);
						} else {
							this.hideBodyMask();
						}
					},
					[this.Terrasoft.MessageBoxButtons.YES.returnCode,
						this.Terrasoft.MessageBoxButtons.NO.returnCode]);
			},
			/**
			 * Показывает/скрывает кнопку связи с существующим договором
			 * @private
			 * @returns {boolean} Возвращает признак видимости кнопки.
			 */
			getLinkButtonVisible: function() {
				return (this.get("CardPageName") === "ContractPageV2");
			},
			/**
			 ** Добавляет элементы манипулирования записями в коллекцию выпадающего списка функциональной кнопки.
			 * @inheritdoc Terrasoft.BaseGridDetailV2#addRecordOperationsMenuItems
			 * @overridden
			 */
			addRecordOperationsMenuItems: function(toolsButtonMenu) {
				this.callParent(arguments);
				toolsButtonMenu.addItem(this.getButtonMenuSeparator());
				toolsButtonMenu.addItem(this.getButtonMenuItem({
					Caption: {"bindTo": "Resources.Strings.LinkWithExistingCaption"},
					Click: {"bindTo": "linkWithExisting"},
					Visible: {"bindTo": "getLinkButtonVisible"}
				}));
				toolsButtonMenu.addItem(this.getButtonMenuItem({
					Caption: {"bindTo": "Resources.Strings.DeleteLinkWithContractsCaption"},
					Click: {"bindTo": "deleteLinkWithContracts"},
					Visible: {"bindTo": "getLinkButtonVisible"},
					Enabled: {"bindTo": "getSelectedItems"}
				}));
			},
			/**
			 * Устанавливает заголовок детали "Договоры" в зависимости от открытой страницы
			 * @protected
			 *
			 * @return {String}
			 */
			getContractDetailCaption: function() {
				var cardPageName = this.get("CardPageName");
				if (cardPageName === "ContractPageV2") {
					return this.get("Resources.Strings.ContractCaption");
				}
				return this.get("Resources.Strings.Caption");
			}
		},
		diff: /**SCHEMA_DIFF*/[
			{
				"operation": "merge",
				"name": "DataGrid",
				"values": {
					"type": "listed",
					"listedConfig": {
						"name": "DataGridListedConfig",
						"items": [
							{
								"name": "NumberListedGridColumn",
								"bindTo": "Number",
								"position": {
									"column": 1,
									"colSpan": 12
								},
								"type": Terrasoft.GridCellType.TITLE
							}
						]
					},
					"tiledConfig": {
						"name": "DataGridTiledConfig",
						"grid": {
							"columns": 24,
							"rows": 3
						},
						"items": [
							{
								"name": "NumberTiledGridColumn",
								"bindTo": "Number",
								"position": {
									"row": 1,
									"column": 1,
									"colSpan": 12
								},
								"type": Terrasoft.GridCellType.TITLE
							}
						]
					}
				}
			},
			{
				"operation": "merge",
				"name": "Detail",
				"values": {
					caption: {bindTo: "getContractDetailCaption"}
				}
			}
		]/**SCHEMA_DIFF*/
	};
});
