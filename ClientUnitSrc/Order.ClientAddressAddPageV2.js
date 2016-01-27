define("ClientAddressAddPageV2", ["ConfigurationConstants", "css!OrderPageV2Styles"],
		function(ConfigurationConstants) {
	return {
		entitySchemaName: "VwClientAddress",
		messages: {
			/**
			 * @message GetClientInfo
			 * Используется для получения информации о клиенте.
			 * @param {Object} Информация о клиенте.
			 */
			"GetClientInfo": {
				mode: this.Terrasoft.MessageMode.PTP,
				direction: this.Terrasoft.MessageDirectionType.PUBLISH
			},

			/**
			 * @message CloseAddressPage
			 * Закрывает текущую страницу.
			 */
			"CloseAddressPage": {
				mode: this.Terrasoft.MessageMode.PTP,
				direction: this.Terrasoft.MessageDirectionType.PUBLISH
			}
		},
		methods: {
			getDefaultValues: function() {
				return [];
			},

			/**
			 * @inheritdoc Terrasoft.BasePageV2#initRunProcessButtonMenu
			 * @overridden
			 */
			initRunProcessButtonMenu: this.Ext.emptyFn,

			/**
			 * @inheritdoc Terrasoft.BasePageV2#checkAvailability
			 * @overridden
			 */
			checkAvailability: function(next) {
				next();
			},

			/**
			 * @inheritdoc Terrasoft.BasePageV2#initQuickAddMenuItems
			 * @overridden
			 */
			initQuickAddMenuItems: this.Ext.emptyFn,

			/**
			 * @inheritdoc Terrasoft.BasePageV2#initViewOptionsButtonMenu
			 * @overridden
			 */
			initViewOptionsButtonMenu: this.Ext.emptyFn,

			/**
			 * @inheritdoc Terrasoft.BasePageV2#initActionButtonMenu
			 * @overridden
			 */
			initActionButtonMenu: this.Ext.emptyFn,

			/**
			 * @inheritdoc Terrasoft.BasePageV2#initCanDesignPage
			 * @overridden
			 */
			initCanDesignPage: this.Ext.emptyFn,

			/**
			 * @inheritdoc Terrasoft.BasePageV2#initCardPrintForms
			 * @overridden
			 */
			initCardPrintForms: this.Ext.emptyFn,

			/**
			 * @inheritdoc Terrasoft.BasePageV2#publishPropertyValueToSection
			 * @overridden
			 */
			publishPropertyValueToSection: this.Ext.emptyFn,

			/**
			 * Закрывает текущую карточку.
			 */
			close: function() {
				this.sandbox.publish("CloseAddressPage", null, [this.sandbox.id]);
			},

			/**
			 * @inheritdoc Terrasoft.BaseSchemaViewModel#showBodyMask
			 * @overridden
			 */
			showBodyMask: function() {
				this.set("PageMaskVisible", true);
			},

			/**
			 * @inheritdoc Terrasoft.BaseSchemaViewModel#hideBodyMask
			 * @overridden
			 */
			hideBodyMask: function() {
				this.set("PageMaskVisible", false);
			},

			/**
			 * @inheritdoc Terrasoft.BasePageV2#init
			 * @overridden
			 */
			init: function() {
				this.callParent(arguments);
				var orderInfo = this.sandbox.publish("GetClientInfo", null, [this.sandbox.id]);
				this.set("ClientInfo", orderInfo || {});
				this.set("Id", this.Terrasoft.generateGUID());
			},

			/**
			 * Возвращает признак активности кнопки сохранения.
			 * @return {Boolean} признак активности кнопки сохранения.
			 */
			getIsSaveButtonEnabled: function() {
				var isAnyValueSet = false;
				var columnsToCheck = ["Country", "Region", "City", "Zip", "Address"];
				this.Terrasoft.each(columnsToCheck, function(columnName) {
					var value = this.get(columnName);
					if (value) {
						if (value.value) {
							value = value.value;
						}
						value = String.prototype.trim.call(value);
					}
					isAnyValueSet = !this.Ext.isEmpty(value);
					if (isAnyValueSet) {
						return false;
					}
				}, this);
				return isAnyValueSet;
			},

			/**
			 * @inheritdoc Terrasoft.BasePageV2#getSaveQuery
			 * @overridden
			 */
			getSaveQuery: function() {
				var orderInfo = this.get("ClientInfo");
				var batchQuery = Ext.create("Terrasoft.BatchQuery");
				var deliveryAddressType = ConfigurationConstants.AddressTypes.Delivery;
				var savedAddresses = [];
				if (orderInfo.ContactId) {
					savedAddresses.push(this.get("Id"));
					var contactInsert = this.callParent(arguments);
					contactInsert.rootSchema = null;
					contactInsert.rootSchemaName = "ContactAddress";
					contactInsert.columnValues.setParameterValue("Contact", {value: orderInfo.ContactId},
						this.Terrasoft.DataValueType.LOOKUP);
					contactInsert.columnValues.setParameterValue("AddressType",
						deliveryAddressType,
						this.Terrasoft.DataValueType.LOOKUP);
					batchQuery.add(contactInsert);
				}
				if (orderInfo.AccountId) {
					var accountAddressId = this.Terrasoft.generateGUID();
					this.set("Id", accountAddressId);
					savedAddresses.push(accountAddressId);
					this.insertQuery = null;//так как this.insertQuery кешируется в родительском методе getInsertQuery.
					var accountInsert = this.callParent(arguments);
					accountInsert.rootSchema = null;
					accountInsert.rootSchemaName = "AccountAddress";
					accountInsert.columnValues.setParameterValue("Account", {value: orderInfo.AccountId},
						this.Terrasoft.DataValueType.LOOKUP);
					accountInsert.columnValues.setParameterValue("AddressType",
						deliveryAddressType,
						this.Terrasoft.DataValueType.LOOKUP);
					batchQuery.add(accountInsert);
				}
				this.set("SavedAddresses", savedAddresses);
				return batchQuery;
			},

			/**
			 * @inheritdoc Terrasoft.BasePageV2#save
			 * @overridden
			 */
			save: function(config) {
				config = config || {};
				config.isSilent = true;
				config.scope = this;
				config.callback = function() {
					this.sandbox.publish("CloseAddressPage", {addressIds: this.get("SavedAddresses")}, [this.sandbox.id]);
				};
				this.callParent(arguments);
			}
		},
		diff: /**SCHEMA_DIFF*/[
			{
				"operation": "merge",
				"name": "CardContentContainer",
				"values": {
					"id": "PopUpCardContentContainer",
					"selectors": {"wrapEl": "#PopUpCardContentContainer"}
				}
			},
			{
				"operation": "merge",
				"name": "HeaderContainer",
				"values": {"maskVisible": {"bindTo": "PageMaskVisible"}}
			},
			{
				"operation": "merge",
				"name": "actions",
				"values": {"visible": false}
			},
			{
				"operation": "remove",
				"name": "AddressType"
			},
			{
				"operation": "merge",
				"name": "Country",
				"values": {
					"layout": {"column": 0, "row": 0, "colSpan": 23},
					"contentType": Terrasoft.ContentType.ENUM
				}
			},
			{
				"operation": "merge",
				"name": "Region",
				"values": {
					"layout": {"column": 0, "row": 1, "colSpan": 23},
					"contentType": Terrasoft.ContentType.ENUM
				}
			},
			{
				"operation": "merge",
				"name": "City",
				"values": {
					"layout": {"column": 0, "row": 2, "colSpan": 23},
					"contentType": Terrasoft.ContentType.ENUM
				}
			},
			{
				"operation": "merge",
				"name": "Zip",
				"values": {"layout": {"column": 0, "row": 3, "colSpan": 23}}
			},
			{
				"operation": "merge",
				"name": "Address",
				"values": {"layout": {"column": 0, "row": 4, "colSpan": 23}}
			},
			{
				"operation": "insert",
				"name": "ButtonsContainer",
				"parentName": "HeaderContainer",
				"propertyName": "items",
				"values": {
					"wrapClass": ["buttons-container"],
					"itemType": Terrasoft.ViewItemType.CONTAINER,
					"items": []
				}
			},
			{
				"operation": "insert",
				"name": "PopupSaveButton",
				"parentName": "ButtonsContainer",
				"propertyName": "items",
				"values": {
					"itemType": Terrasoft.ViewItemType.BUTTON,
					"caption": {"bindTo": "Resources.Strings.SaveButtonCaption"},
					"classes": {"textClass": "actions-button-margin-right"},
					"click": {"bindTo": "save"},
					"style": Terrasoft.controls.ButtonEnums.style.BLUE,
					"enabled": {"bindTo": "getIsSaveButtonEnabled"},
					"tag": "save",
					"markerValue": "SaveButton"
				}
			},
			{
				"operation": "insert",
				"name": "PopupCloseButton",
				"parentName": "ButtonsContainer",
				"propertyName": "items",
				"values": {
					"itemType": Terrasoft.ViewItemType.BUTTON,
					"caption": {"bindTo": "Resources.Strings.CloseButtonCaption"},
					"classes": {"textClass": "actions-button-margin-right"},
					"click": {"bindTo": "close"},
					"style": Terrasoft.controls.ButtonEnums.style.DEFAULT,
					"tag": "close",
					"markerValue": "CloseButton"
				}
			}
		]/**SCHEMA_DIFF*/,
		rules: {}
	};
});
