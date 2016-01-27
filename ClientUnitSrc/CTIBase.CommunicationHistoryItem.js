define("CommunicationHistoryItem", ["terrasoft", "CtiConstants", "NetworkUtilities"],
	function(Terrasoft, CtiConstants, NetworkUtilities) {
		return {
			attributes: {

				/**
				 * Идентификатор абонента.
				 */
				"Id": {
					"dataValueType": Terrasoft.DataValueType.TEXT,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": ""
				},

				/**
				 * Тип абонента.
				 */
				"Type": {
					"dataValueType": Terrasoft.DataValueType.TEXT,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": ""
				},

				/**
				 * Имя абонента.
				 */
				"Name": {
					"dataValueType": Terrasoft.DataValueType.TEXT,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": ""
				},

				/**
				 * Идентификатор фото абонента.
				 */
				"Photo": {
					"dataValueType": Terrasoft.DataValueType.TEXT,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": ""
				},

				/**
				 * Департамент сотрудника.
				 */
				"Department": {
					"dataValueType": Terrasoft.DataValueType.TEXT,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": ""
				},

				/**
				 * Контрагент контакта.
				 */
				"AccountName": {
					"dataValueType": Terrasoft.DataValueType.TEXT,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": ""
				},

				/**
				 * Должность абонента.
				 */
				"Job": {
					"dataValueType": Terrasoft.DataValueType.TEXT,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": ""
				},

				/**
				 * Тип контрагента.
				 */
				"AccountType": {
					"dataValueType": Terrasoft.DataValueType.TEXT,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": ""
				},

				/**
				 * Город контрагента.
				 */
				"City": {
					"dataValueType": Terrasoft.DataValueType.TEXT,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": ""
				},

				/**
				 * Номер абонента.
				 */
				"Number": {
					"dataValueType": Terrasoft.DataValueType.TEXT,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": ""
				},

				/**
				 * Тип звонка.
				 */
				"CallType": {
					"dataValueType": Terrasoft.DataValueType.TEXT,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": ""
				}
			},
			methods: {

				/**
				 * Возвращает конфигурацию изображения с фото абонента или иконкой контрагента.
				 * @private
				 * @returns {Object} Конфигурация изображения.
				 */
				getPhoto: function() {
					var subscriberType = this.get("Type");
					var photoId = this.get("Photo");
					if (subscriberType === CtiConstants.SubscriberTypes.Account) {
						return this.get("Resources.Images.AccountIdentifiedPhoto");
					}
					if (Ext.isEmpty(photoId) || this.Terrasoft.isEmptyGUID(photoId)) {
						return this.get("Resources.Images.ContactEmptyPhotoWhite");
					}
					var photoConfig =  {
						source: this.Terrasoft.ImageSources.ENTITY_COLUMN,
						params: {
							schemaName: "SysImage",
							columnName: "Data",
							primaryColumnValue: photoId
						}
					};
					return  {
						source: Terrasoft.ImageSources.URL,
						url: Terrasoft.ImageUrlBuilder.getUrl(photoConfig)
					};
				},

				/**
				 * Возвращает конфигурацию изображения типа звонка.
				 * @private
				 * @returns {Object} Конфигурация изображения типа звонка.
				 */
				getCallTypeIcon: function() {
					var callType = this.get("CallType");
					var сallTypeIcon;
					switch (callType) {
						case CtiConstants.CallType.INCOMING:
							сallTypeIcon = this.get("Resources.Images.IncomingCallIcon");
							break;
						case CtiConstants.CallType.OUTGOING:
							сallTypeIcon = this.get("Resources.Images.OutgoingCallIcon");
							break;
						case CtiConstants.CallType.MISSED:
							сallTypeIcon = this.get("Resources.Images.MissedIconCall");
							break;
						default:
							break;
					}
					return сallTypeIcon;
				},

				/**
				 * Определяет, являются ли данные идентификации видимые по тэгу элемента управления.
				 * @private
				 * @param {String} tag Тэг отображаемого элемента.
				 * @returns {Boolean} Видимость данных.
				 */
				getIsInfoLabelVisible: function(tag) {
					var labelValue = this.get(tag);
					return !Ext.isEmpty(labelValue);
				},

				/**
				 * Определяет, являются ли данные номера идентификации видимые.
				 * @private
				 * @returns {Boolean} Видимость данных.
				 */
				getIsNumberButtonVisible: function() {
					var subscriberType = this.get("Type");
					return !Ext.isEmpty(subscriberType);
				},

				/**
				 * Обрабатывает клик на имя или название абонента. Если абонент идентифицирован, то открывает его
				 * карточку редактирования, если нет - совершает звонок на номер абонента.
				 * @private
				 * @param {String} tag Тэг элемента.
				 */
				onNameClick: function() {
					var subscriberType = this.get("Type");
					var schemaName = "";
					if (!Ext.isEmpty(subscriberType)) {
						schemaName = (subscriberType !== CtiConstants.SubscriberTypes.Employee)
							? subscriberType
							: CtiConstants.SubscriberTypes.Contact;
						var hash = NetworkUtilities.getEntityUrl(schemaName, this.get("Id"));
						this.sandbox.publish("PushHistoryState", {hash: hash});
					} else {
						this.onNumberClick();
					}
				},

				/**
				 * Обрабатывает клик на номер телефона абонента.
				 * @private
				 */
				onNumberClick: function() {
					var ctiModel = Terrasoft.CtiModel;
					var subscriberType = this.get("Type");
					if (!Ext.isEmpty(subscriberType)) {
						ctiModel.set("AdvisedIdentifiedSubscriber", this.get("Id"));
					}
					var number = this.get("Number");
					ctiModel.callByNumber(number);
				}
			},
			diff: [
				{
					"operation": "insert",
					"name": "CommunicationHistoryItemContainer",
					"values": {
						"id": "CommunicationHistoryItemContainer",
						"selectors": {
							"wrapEl": "#CommunicationHistoryItemContainer"
						},
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"markerValue": {"bindTo": "Name"},
						"wrapClass": ["communication-history-item-container"],
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "Photo",
					"parentName": "CommunicationHistoryItemContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"imageConfig": {"bindTo": "getPhoto"},
						"classes": {"wrapperClass": ["photo"]},
						"markerValue": "Photo",
						"style": Terrasoft.controls.ButtonEnums.style.TRANSPARENT
					}
				},
				{
					"operation": "insert",
					"name": "CommunicationHistoryDataContainer",
					"parentName": "CommunicationHistoryItemContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"markerValue": "CommunicationHistoryDataContainer",
						"wrapClass": ["data-container"],
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "Name",
					"parentName": "CommunicationHistoryDataContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"classes": {"textClass": ["communication-history-name"]},
						"markerValue": {"bindTo": "Name"},
						"caption": {"bindTo": "Name"},
						"hint": {"bindTo": "Name"},
						"click": {"bindTo": "onNameClick"},
						"style": Terrasoft.controls.ButtonEnums.style.TRANSPARENT
					}
				},
				{
					"operation": "insert",
					"name": "CallButton",
					"parentName": "CommunicationHistoryDataContainer",
					"propertyName": "items",
					"values": {
						"id": "CallButton",
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"imageConfig": {"bindTo": "Resources.Images.MakeCallButtonIcon"},
						"classes": {"wrapperClass": "call-button"},
						"markerValue": "CallButton",
						"style": Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
						"click": {"bindTo": "onNumberClick"}
					}
				},
				{
					"operation": "insert",
					"name": "SubscriberData",
					"parentName": "CommunicationHistoryDataContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.LABEL,
						"classes": {"labelClass": ["data"]},
						"markerValue": {"bindTo": "SubscriberData"},
						"caption": {"bindTo": "SubscriberData"},
						"visible": {"bindTo": "getIsInfoLabelVisible"},
						"hint": {"bindTo": "SubscriberData"},
						"tag": "SubscriberData"
					}
				},
				{
					"operation": "insert",
					"name": "NumberContainer",
					"parentName": "CommunicationHistoryItemContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"markerValue": "NumberContainer",
						"wrapClass": ["number-container"],
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "CallType",
					"parentName": "NumberContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"imageConfig": {"bindTo": "getCallTypeIcon"},
						"classes": {"wrapperClass": ["call-type"]},
						"markerValue": "CallType",
						"style": Terrasoft.controls.ButtonEnums.style.TRANSPARENT
					}
				},
				{
					"operation": "insert",
					"name": "CallDate",
					"parentName": "NumberContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.LABEL,
						"classes": {"labelClass": ["call-date"]},
						"markerValue": {"bindTo": "CallDate"},
						"caption": {"bindTo": "CallDate"}
					}
				},
				{
					"operation": "insert",
					"name": "Number",
					"parentName": "NumberContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.LABEL,
						"classes": {"labelClass": ["call-number"]},
						"markerValue": {"bindTo": "Number"},
						"caption": {"bindTo": "Number"},
						"hint": {"bindTo": "Number"},
						"click": {"bindTo": "onNumberClick"},
						"visible": {"bindTo": "getIsNumberButtonVisible"}
					}
				}
			]
		};
	}
);
