define("IdentifiedSubscriberItem", ["terrasoft", "CtiConstants"],
	function(Terrasoft, CtiConstants) {
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
				 * Департамент абонента.
				 */
				"Department": {
					"dataValueType": Terrasoft.DataValueType.TEXT,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": ""
				},

				/**
				 * Контрагент абонента.
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
				 * Тип контрагента, когда абонент идентифицирован как контрагент.
				 */
				"AccountType": {
					"dataValueType": Terrasoft.DataValueType.TEXT,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": ""
				},

				/**
				 * Город абонента.
				 */
				"City": {
					"dataValueType": Terrasoft.DataValueType.TEXT,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": ""
				},

				/**
				 * Тип средства связи.
				 */
				"CommunicationType": {
					"dataValueType": Terrasoft.DataValueType.TEXT,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": ""
				},

				/**
				 * Номер, по которому удалось найти абонента.
				 */
				"Number": {
					"dataValueType": Terrasoft.DataValueType.TEXT,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": ""
				},

				/**
				 * Отображаемые данные по идентифицированному абоненту, в зависимости от его типа.
				 * Ключ - тип абонента, значение - массив имен полей данных идентификации, которые следует отобразить.
				 * @private
				 * @type {Object}
				 */
				"SubscriberColumnsByType": {
					"dataValueType": Terrasoft.DataValueType.CUSTOM_OBJECT,
					"value": {
						"Contact": ["AccountName", "Job"],
						"Account": ["AccountType", "City"],
						"Employee": ["Department"]
					}
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
				 * Определяет, являются ли данные идентификации видимые по тэгу элемента управления.
				 * @param {String} tag Тэг отображаемого элемента.
				 * @returns {Boolean} Видимость данных.
				 */
				getIsInfoLabelVisible: function(tag) {
					var type = this.get("Type");
					var subscriberColumnsByType = this.get("SubscriberColumnsByType");
					var subscriberColumns = subscriberColumnsByType[type];
					if (Ext.isEmpty(subscriberColumns) || (subscriberColumns.indexOf(tag) === -1)) {
						return false;
					}
					var infoLabelValue = this.get(tag);
					return !Ext.isEmpty(infoLabelValue);
				}
			},
			diff: [
				{
					"operation": "insert",
					"name": "IdentifiedSubscriberItemContainer",
					"values": {
						"id": "IdentifiedSubscriberItemContainer",
						"selectors": {
							"wrapEl": "#IdentifiedSubscriberItemContainer"
						},
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"wrapClass": ["identified-subscriber-item-container"],
						"markerValue": {"bindTo": "Name"},
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "Photo",
					"parentName": "IdentifiedSubscriberItemContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"imageConfig": {"bindTo": "getPhoto"},
						"classes": {"wrapperClass": ["subscriber-photo"]},
						"markerValue": "Photo",
						"style": Terrasoft.controls.ButtonEnums.style.TRANSPARENT
					}
				},
				{
					"operation": "insert",
					"name": "SubscriberDataContainer",
					"parentName": "IdentifiedSubscriberItemContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"wrapClass": ["subscriber-data-container"],
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "Name",
					"parentName": "SubscriberDataContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.LABEL,
						"classes": {"labelClass": ["subscriber-name"]},
						"markerValue": {"bindTo": "Name"},
						"caption": {"bindTo": "Name"},
						"hint": {"bindTo": "Name"}
					}
				},
				{
					"operation": "insert",
					"name": "AccountName",
					"parentName": "SubscriberDataContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.LABEL,
						"classes": {"labelClass": ["subscriber-data"]},
						"markerValue": {"bindTo": "AccountName"},
						"caption": {"bindTo": "AccountName"},
						"visible": {"bindTo": "getIsInfoLabelVisible"},
						"hint": {"bindTo": "AccountName"},
						"tag": "AccountName"
					}
				},
				{
					"operation": "insert",
					"name": "Department",
					"parentName": "SubscriberDataContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.LABEL,
						"classes": {"labelClass": ["subscriber-data"]},
						"markerValue": {"bindTo": "Department"},
						"caption": {"bindTo": "Department"},
						"visible": {"bindTo": "getIsInfoLabelVisible"},
						"hint": {"bindTo": "Department"},
						"tag": "Department"
					}
				},
				{
					"operation": "insert",
					"name": "Job",
					"parentName": "SubscriberDataContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.LABEL,
						"classes": {"labelClass": ["subscriber-data"]},
						"markerValue": {"bindTo": "Job"},
						"caption": {"bindTo": "Job"},
						"visible": {"bindTo": "getIsInfoLabelVisible"},
						"hint": {"bindTo": "Job"},
						"tag": "Job"
					}
				},
				{
					"operation": "insert",
					"name": "AccountType",
					"parentName": "SubscriberDataContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.LABEL,
						"classes": {"labelClass": ["subscriber-data"]},
						"markerValue": {"bindTo": "AccountType"},
						"caption": {"bindTo": "AccountType"},
						"visible": {"bindTo": "getIsInfoLabelVisible"},
						"hint": {"bindTo": "AccountType"},
						"tag": "AccountType"
					}
				},
				{
					"operation": "insert",
					"name": "City",
					"parentName": "SubscriberDataContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.LABEL,
						"classes": {"labelClass": ["subscriber-data"]},
						"markerValue": {"bindTo": "City"},
						"caption": {"bindTo": "City"},
						"visible": {"bindTo": "getIsInfoLabelVisible"},
						"hint": {"bindTo": "City"},
						"tag": "City"
					}
				},
				{
					"operation": "insert",
					"name": "NumberContainer",
					"parentName": "IdentifiedSubscriberItemContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"wrapClass": ["subscriber-number-container"],
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "CommunicationType",
					"parentName": "NumberContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.LABEL,
						"classes": {"labelClass": ["subscriber-communication-type-name"]},
						"markerValue": {"bindTo": "CommunicationType"},
						"caption": {"bindTo": "CommunicationType"},
						"hint": {"bindTo": "CommunicationType"}
					}
				},
				{
					"operation": "insert",
					"name": "Number",
					"parentName": "NumberContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.LABEL,
						"classes": {"labelClass": ["subscriber-number"]},
						"markerValue": {"bindTo": "Number"},
						"caption": {"bindTo": "Number"},
						"hint": {"bindTo": "Number"}
					}
				}
			]
		};
	});
