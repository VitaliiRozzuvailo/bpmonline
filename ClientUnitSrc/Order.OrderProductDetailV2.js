define("OrderProductDetailV2", ["css!OrderPageV2Styles", "css!SummaryModuleV2"], function() {
	return {
		entitySchemaName: "OrderProduct",
		messages: {
			/**
			 * @message GetOrderProductSummary
			 * Получение информации для итога.
			 */
			"GetOrderProductSummary": {
				mode: Terrasoft.MessageMode.PTP,
				direction: Terrasoft.MessageDirectionType.PUBLISH
			},

			/**
			 * @message UpdateOrderProductSummary
			 * Обновление итога.
			 */
			"UpdateOrderProductSummary": {
				mode: Terrasoft.MessageMode.PTP,
				direction: Terrasoft.MessageDirectionType.SUBSCRIBE
			},

			/**
			 * @message DiscardChanges
			 * Событие отмены изменений на странице заказа.
			 */
			"DiscardChanges": {
				mode: Terrasoft.MessageMode.BROADCAST,
				direction: Terrasoft.MessageDirectionType.SUBSCRIBE
			}
		},
		methods: {

			/**
			 * @inheritdoc Terrasoft.BaseGridDetailV2#init
			 * @overridden
			 */
			init: function() {
				this.callParent(arguments);
				this.set("MultiSelect", true);
				this.set("isCollapsed", false);
				this.set("SummaryLoaded", false);
			},

			/**
			 * @inheritdoc Terrasoft.BaseGridDetailV2#loadGridData
			 * @overridden
			 */
			loadGridData: function() {
				this.callParent(arguments);
				this.updateSummary();
			},

			/**
			 * Обновляет значение итога.
			 */
			updateSummary: function() {
				var summary =  this.sandbox.publish("GetOrderProductSummary", null, [this.sandbox.id]);
				this.set("TotalCount", summary.count);
				this.set("TotalAmount", this.Ext.String.format("{0} {1}", summary.currency,
						this.Terrasoft.getFormattedNumberValue(summary.amount || 0)));
				this.set("SummaryLoaded", Boolean(summary.currency));
			},

			/**
			 * Возвращает видимость итога.
			 * @return {Boolean} Видимость итога.
			 */
			getSummaryVisible: function() {
				return this.getToolsVisible() && this.get("SummaryLoaded");
			},

			/**
			 * @inheritdoc Terrasoft.BaseGridDetailV2#subscribeSandboxEvents
			 * @overridden
			 */
			subscribeSandboxEvents: function() {
				this.callParent(arguments);
				this.sandbox.subscribe("UpdateOrderProductSummary", this.updateSummary, this, [this.sandbox.id]);
				this.sandbox.subscribe("DiscardChanges", this.updateSummary, this, [this.sandbox.id]);
				this.sandbox.subscribe("RerenderDetail", function(config) {
					if (this.viewModel) {
						var renderTo = this.Ext.get(config.renderTo);
						if (renderTo) {
							if (this.view) {
								this.view.destroyed = true;
							}
							this.render(renderTo);
							return true;
						}
					}
				}, this, [this.sandbox.id]);
			},

			/**
			 * @inheritdoc Terrasoft.GridUtilitiesV2#onDataChanged
			 * @overridden
			 */
			onDataChanged: function() {
				this.callParent(arguments);
				this.updateSummary();
			},

			/**
			 * @inheritdoc Terrasoft.ConfigurationGridUtilities#saveRowChanges
			 * @overridden
			 */
			saveRowChanges: function() {
				this.fireDetailChanged(null);
				this.updateSummary();
				this.callParent(arguments);
			},

			/**
			 * @inheritdoc Terrasoft.BaseGridDetailV2#updateDetail
			 * @overridden
			 */
			updateDetail: function(config) {
				if (!config.reloadAll) {
					this.fireDetailChanged({action: "reloadAll", rows: []});
					config.reloadAll = true;
				}
				this.callParent([config]);
			},

			/**
			 * @inheritdoc Terrasoft.BaseGridDetailV2#onRender
			 * @overridden
			 */
			onRender: function() {
				this.reloadGridData();
			}
		},
		diff: /**SCHEMA_DIFF*/[
			{
				"operation": "merge",
				"name": "Detail",
				"values": {"classes": {"wrapClass": ["detail", "order-product-detail"]}}
			},
			{
				"operation": "insert",
				"name": "summaryItemsContainer",
				"propertyName": "tools",
				"parentName": "Detail",
				"values": {
					"id": "summaryItemContainer",
					"selectors": {"wrapEl": "#summaryItemContainer"},
					"itemType": Terrasoft.ViewItemType.CONTAINER,
					"wrapClass": ["summary-item-container"],
					"visible": {"bindTo": "getSummaryVisible"},
					"items": []
				}
			},
			{
				"operation": "insert",
				"name": "summaryCountCaption",
				"parentName": "summaryItemsContainer",
				"propertyName": "items",
				"values": {
					"caption": {"bindTo": "Resources.Strings.TotalCountCaption"},
					"itemType": Terrasoft.ViewItemType.LABEL,
					"classes": {"labelClass": ["summary-item-caption"]}
				}
			},
			{
				"operation": "insert",
				"name": "summaryCountValue",
				"parentName": "summaryItemsContainer",
				"propertyName": "items",
				"values": {
					"caption": {"bindTo": "TotalCount"},
					"markerValue": {"bindTo": "Resources.Strings.TotalCountCaption"},
					"itemType": Terrasoft.ViewItemType.LABEL,
					"classes": {"labelClass": ["summary-item-value"]}
				}
			},
			{
				"operation": "insert",
				"name": "summaryAmountCaption",
				"parentName": "summaryItemsContainer",
				"propertyName": "items",
				"values": {
					"caption": {"bindTo": "Resources.Strings.TotalAmountCaption"},
					"itemType": Terrasoft.ViewItemType.LABEL,
					"classes": {"labelClass": ["summary-item-caption"]}
				}
			},
			{
				"operation": "insert",
				"name": "summaryAmountValue",
				"parentName": "summaryItemsContainer",
				"propertyName": "items",
				"values": {
					"caption": {"bindTo": "TotalAmount"},
					"markerValue": {"bindTo": "Resources.Strings.TotalAmountCaption"},
					"itemType": Terrasoft.ViewItemType.LABEL,
					"classes": {"labelClass": ["summary-item-value"]}
				}
			}
		]/**SCHEMA_DIFF*/
	};
});
