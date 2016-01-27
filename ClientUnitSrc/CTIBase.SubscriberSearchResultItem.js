define("SubscriberSearchResultItem", ["terrasoft", "CtiConstants", "NetworkUtilities"],
	function(Terrasoft, CtiConstants, NetworkUtilities) {
		return {
			attributes: {

				/**
				 * Идентификатор абонента.
				 * @private
				 * @type {String}
				 */
				"Id": {
					"dataValueType": Terrasoft.DataValueType.TEXT,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": ""
				},

				/**
				 * Тип абонента.
				 * @private
				 * @type {String}
				 */
				"Type": {
					"dataValueType": Terrasoft.DataValueType.TEXT,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": ""
				},

				/**
				 * Имя абонента.
				 * @private
				 * @type {String}
				 */
				"Name": {
					"dataValueType": Terrasoft.DataValueType.TEXT,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": ""
				},

				/**
				 * Идентификатор фото абонента.
				 * @private
				 * @type {String}
				 */
				"Photo": {
					"dataValueType": Terrasoft.DataValueType.TEXT,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": ""
				},

				/**
				 * Департамент абонента.
				 * @private
				 * @type {String}
				 */
				"Department": {
					"dataValueType": Terrasoft.DataValueType.TEXT,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": ""
				},

				/**
				 * Контрагент абонента.
				 * @private
				 * @type {String}
				 */
				"AccountName": {
					"dataValueType": Terrasoft.DataValueType.TEXT,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": ""
				},

				/**
				 * Должность абонента.
				 * @private
				 * @type {String}
				 */
				"Job": {
					"dataValueType": Terrasoft.DataValueType.TEXT,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": ""
				},

				/**
				 * Тип контрагента, когда абонент идентифицирован как контрагент.
				 * @private
				 * @type {String}
				 */
				"AccountType": {
					"dataValueType": Terrasoft.DataValueType.TEXT,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": ""
				},

				/**
				 * Город абонента.
				 * @private
				 * @type {String}
				 */
				"City": {
					"dataValueType": Terrasoft.DataValueType.TEXT,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": ""
				},

				/**
				 * Коллекция панелей средств связи абонента.
				 * @private
				 * @type {Terrasoft.Collection}
				 */
				"SubscriberCommunications": {
					"dataValueType": Terrasoft.DataValueType.COLLECTION
				},

				/**
				 * Объект CTI модели.
				 * @private
				 * @type {Terrasoft.CtiModel}
				 */
				"CtiModel": {
					"dataValueType": Terrasoft.DataValueType.CUSTOM_OBJECT,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": null
				}

			},
			methods: {

				//region Methods: Private

				/**
				 * Задает конфигурацию элемента коллекции панелей средств связи абонента для панели результата поиска.
				 * @private
				 * @param {Object} item Элемент коллекции панелей средств связи абонента.
				 */
				getCommunicationPanelViewConfig: function(item) {
					var ctiModel = this.get("CtiModel");
					var panelView = ctiModel.сommunicationPanelView;
					var view = ctiModel.get(panelView);
					item.config = Terrasoft.deepClone(view);
				},

				//endregion

				//region Methods: Protected

				/**
				 * Возвращает конфигурацию изображения с фото абонента или иконкой контрагента.
				 * @protected
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
				 * Определяет, является ли элемент видимым, в зависимости от его подписи.
				 * @protected
				 * @param {String} captionValue Значение подписи.
				 * @returns {Boolean} Элемент видим.
				 */
				getIsDataLabelVisible: function(captionValue) {
					return !Ext.isEmpty(captionValue);
				},

				/**
				 * Производит переход в карточку найденного контакта или контрагента.
				 * @protected
				 */
				onNameClick: function() {
					var subscriberType = this.get("Type");
					var schemaName = (subscriberType !== CtiConstants.SubscriberTypes.Employee)
						? subscriberType
						: CtiConstants.SubscriberTypes.Contact;
					var hash = NetworkUtilities.getEntityUrl(schemaName, this.get("Id"));
					this.sandbox.publish("PushHistoryState", {hash: hash});
				}

				//endregion

			},
			diff: [
				{
					"operation": "insert",
					"name": "SubscriberSearchResultItemContainer",
					"values": {
						"id": "SubscriberSearchResultItemContainer",
						"selectors": {"wrapEl": "#SubscriberSearchResultItemContainer"},
						"markerValue": {"bindTo": "Name"},
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"wrapClass": ["subscriber-search-result-item-container"],
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "Photo",
					"parentName": "SubscriberSearchResultItemContainer",
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
					"parentName": "SubscriberSearchResultItemContainer",
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
						"hint": {"bindTo": "Name"},
						"click": {"bindTo": "onNameClick"}
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
						"visible": {
							"bindTo": "AccountName",
							"bindConfig": {"converter": "getIsDataLabelVisible"}
						},
						"hint": {"bindTo": "AccountName"}
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
						"visible": {
							"bindTo": "Department",
							"bindConfig": {"converter": "getIsDataLabelVisible"}
						},
						"hint": {"bindTo": "Department"}
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
						"visible": {
							"bindTo": "Job",
							"bindConfig": {"converter": "getIsDataLabelVisible"}
						},
						"hint": {"bindTo": "Job"}
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
						"visible": {
							"bindTo": "AccountType",
							"bindConfig": {"converter": "getIsDataLabelVisible"}
						},
						"hint": {"bindTo": "AccountType"}
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
						"visible": {
							"bindTo": "City",
							"bindConfig": {"converter": "getIsDataLabelVisible"}
						},
						"hint": {"bindTo": "City"}
					}
				},
				{
					"operation": "insert",
					"name": "CommunicationItemsListContainer",
					"parentName": "SubscriberSearchResultItemContainer",
					"propertyName": "items",
					"values": {
						"id": "CommunicationItemsListContainer",
						"itemType": Terrasoft.ViewItemType.GRID,
						"markerValue": "CommunicationItemsListContainer",
						"selectors": {"wrapEl": "#CommunicationItemsListContainer"},
						"idProperty": "Id",
						"collection": {"bindTo": "SubscriberCommunications"},
						"onGetItemConfig": {"bindTo": "getCommunicationPanelViewConfig"},
						"classes": {"wrapClassName": ["communications-control-group"]},
						"generator": "CtiContainerListGenerator.generatePartial"
					}
				}
			]
		};
	});
