define("ProductPriceDetailV2", ["BusinessRuleModule", "RightUtilities"], function(BusinessRuleModule, RightUtilities) {
	return {
		entitySchemaName: "ProductPrice",
		attributes: {
			/**
			 * Базовый прайс-лист из системной настройки
			 * @type {Terrasoft.DataValueType.LOOKUP}
			 */
			BasePriceList: {
				dataValueType: this.Terrasoft.DataValueType.LOOKUP,
				type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
			},

			/**
			 * Признак наличия в удаляемых записях базового прайс-листа
			 * @type {Terrasoft.DataValueType.BOOLEAN}
			 */
			HasBaseItem: {
				dataValueType: this.Terrasoft.DataValueType.BOOLEAN
			}
		},
		methods: {
			/**
			 * Инициализирует начальные значения модели
			 * @protected
			 * @virtual
			 * @overriden
			 */
			init: function() {
				Terrasoft.SysSettings.querySysSettingsItem("BasePriceList",
					function(value) {
						this.set("BasePriceList", value);
					}, this);
				this.callParent(arguments);
			},

			/**
			 * Проверяет наличие среди удаляемых "Базового" прайс-листа (Установленный в системной настройке)
			 * @protected
			 * @param {Terrasoft.Collection} items
			 * @returns {boolean}
			 */
			checkAndSetHasIsBaseInDeleteItems: function(items) {
				var hasIsBaseItem = false;
				var gridData = this.getGridData();
				if (gridData) {
					this.Terrasoft.each(items, function(itemKey) {
						var item = gridData.get(itemKey);
						var basePriceList = this.get("BasePriceList");
						var priceList = item.get("PriceList");
						hasIsBaseItem =
							(hasIsBaseItem || (basePriceList && priceList && (basePriceList.value === priceList.value)));
					}, this);
				}
				this.set("HasBaseItem", hasIsBaseItem);
			},

			/**
			 * Удаляет выделенные записи
			 * @protected
			 * @overriden
			 */
			deleteRecords: function() {
				var items = this.getSelectedItems();
				if (!items || !items.length) {
					return;
				}
				this.checkAndSetHasIsBaseInDeleteItems(items);
				if (items.length === 1) {
					RightUtilities.checkCanDelete({
						schemaName: this.entitySchema.name,
						primaryColumnValue: items[0]
					}, this.deleteCallback, this);
				} else {
					RightUtilities.checkMultiCanDelete({
						schemaName: this.entitySchema.name,
						primaryColumnValues: items
					}, this.deleteCallback, this);
				}
			},

			/**
			 * Функция обратного вызова удаления записей
			 * @param {String} result
			 */
			deleteCallback: function(result) {
				if (result) {
					this.showInformationDialog(this.get("Resources.Strings." + result), function() {
					}, {
						style: this.Terrasoft.MessageBoxStyles.BLUE
					});
				} else {
					if (!this.get("HasBaseItem")) {
						this.showConfirmationDialog(this.get("Resources.Strings.DeleteConfirmationMessage"),
							function(returnCode) {
								if (returnCode === this.Terrasoft.MessageBoxButtons.YES.returnCode) {
									this.onDeleteAccept();
								}
							},
							[this.Terrasoft.MessageBoxButtons.YES.returnCode,
								this.Terrasoft.MessageBoxButtons.NO.returnCode],
							null);
					} else {
						this.showInformationDialog(this.get("Resources.Strings.DeleteHasIsBaseItemMessage"),
							function() {}, {style: this.Terrasoft.MessageBoxStyles.BLUE});
					}
				}
			},

			/**
			 * @inheritdoc Terrasoft.GridUtilitiesV2#getFilterDefaultColumnName
			 * @overridden
			 */
			getFilterDefaultColumnName: function() {
				return "PriceList";
			}
		},
		diff: /**SCHEMA_DIFF*/[
			{
				"operation": "merge",
				"name": "DataGrid",
				"values": {
					"primaryDisplayColumnName": "PriceList"
				}
			}
		]/**SCHEMA_DIFF*/
	};
});
