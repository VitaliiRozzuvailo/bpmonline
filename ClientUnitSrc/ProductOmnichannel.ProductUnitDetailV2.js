define("ProductUnitDetailV2", ["RightUtilities"],
	function(RightUtilities) {
		return {
			entitySchemaName: "ProductUnit",
			attributes: {
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
				 * Проверяет наличие среди удаляемых записей, записи с признаком "Базовая"
				 * @protected
				 * @param {Terrasoft.Collection} items Коллекция удаляемых елементов
				 */
				checkAndSetHasIsBaseInDeleteItems: function(items) {
					var hasIsBaseItem = false;
					var gridData = this.getGridData();
					if (gridData) {
						this.Terrasoft.each(items, function(itemKey) {
							var item = gridData.get(itemKey);
							hasIsBaseItem = hasIsBaseItem || item.get("IsBase");
						}, this);
					}
					this.set("HasBaseItem", hasIsBaseItem);
				},

				/**
				 * Обновляет деталь
				 * @protected
				 * @param {Object} config
				 * @overriden
				 */
				updateDetail: function(config) {
					config.reloadAll = true;
					this.callParent(arguments);
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
					return "Unit";
				}
			}
		};
	}
);
