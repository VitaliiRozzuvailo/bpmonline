define("BaseCommunicationDetail", ["CommunicationUtils", "SocialSearch"], function(CommunicationUtils) {
	return {
		attributes: {
			SocialSearchModuleId: {dataValueType: Terrasoft.DataValueType.TEXT}

		},
		messages: {
			/**
			 * @message
			 * Публикация сообщения для получения информации о карточки для детали.
			 */
			"GetDetailInfo": {
				mode: Terrasoft.MessageMode.PTP,
				direction: Terrasoft.MessageDirectionType.PUBLISH
			},

			/**
			 * @message
			 * Публикация сообщения установки состояния истории браузера.
			 */
			"PushHistoryState": {
				mode: Terrasoft.MessageMode.PTP,
				direction: Terrasoft.MessageDirectionType.PUBLISH
			},

			/**
			 * @message SearchResultBySocialNetworks
			 * Получает выбранные данные из социальных сетей.
			 */
			"SearchResultBySocialNetworks": {
				mode: Terrasoft.MessageMode.BROADCAST,
				direction: Terrasoft.MessageDirectionType.SUBSCRIBE
			}
		},
		methods: {

			/**
			 * @inheritdoc Terrasoft.BaseCommunicationDetail#subscribeSandboxEvents
			 * @overridden
			 */
			subscribeSandboxEvents: function() {
				this.callParent(arguments);
				this.sandbox.subscribe("SearchResultBySocialNetworks", this.onSearchResultBySocialNetworks, this);
			},

			/**
			 * Обрабатывает результат поиска учетной записи в социальной сети.
			 * @private
			 * @param {Object} searchResult Результат поиска учетной записи в социальной сети.
			 * @param {Terrasoft.Collection} searchResult.selectedItems Коллекция выбранных записей на странице поиска.
			 */
			onSearchResultBySocialNetworks: function(searchResult) {
				var collection = searchResult.selectedItems;
				collection.each(function(item) {
					var newItem = this.addItem(item.get("CommunicationType"));
					newItem.set("Number", item.get("Name"));
					newItem.set("SocialMediaId", item.get("Id"));
				}, this);
			},

			/**
			 * Возвращает отфильтрованную по типу средства связи коллекцию данных детали.
			 * @protected
			 * @param {String} communicationTypeFilter Тип средства связи.
			 * @return {Terrasoft.Collection} Отфильтрованная по типу средства связи коллекция данных детали.
			 */
			getCommunications: function(communicationTypeFilter) {
				var collection = this.get("Collection");
				var filteredCollection = collection.filterByFn(function(communication) {
					var communicationType = communication.get("CommunicationType");
					if (!communicationType) {
						return false;
					}
					return (communicationType.value === communicationTypeFilter);
				});
				return filteredCollection;
			},

			/**
			 * Загружает модуль поиска в социальных сетях.
			 * @protected
			 * @param {Object} config Параметры загрузки модуля.
			 * @param {String} config.schemaName Название схемы, которая будет использоваться модулем.
			 */
			loadSocialSearchModule: function(config) {
				var moduleId = this.sandbox.id + "_SocialSearch";
				var detailInfo = this.getDetailInfo();
				var moduleConfig = {
					moduleId: moduleId,
					moduleName: "SocialSearch",
					stateObj: {},
					instanceConfig: {
						isSchemaConfigInitialized: true,
						schemaName: config.schemaName,
						searchQuery: detailInfo.masterRecordDisplayValue
					}
				};
				this.sandbox.publish("OpenCard", moduleConfig, [this.sandbox.id]);
			},

			/**
			 * @inheritdoc Terrasoft.BaseCommunicationDetail#addMenuItem
			 * @overridden
			 */
			addMenuItem: function(typeMenuItems, communicationType) {
				var value = communicationType.get("Id");
				if (CommunicationUtils.isSocialNetworkType(value)) {
					return;
				}
				this.callParent(arguments);
			}

		},
		diff: /**SCHEMA_DIFF*/[
			{
				"operation": "insert",
				"name": "SocialNetworksContainer",
				"parentName": "Detail",
				"propertyName": "tools",
				"values": {
					"visible": {"bindTo": "getToolsVisible"},
					"itemType": Terrasoft.ViewItemType.CONTAINER,
					"wrapClass": ["social-networks-container"],
					"items": []
				}
			}
		]/**SCHEMA_DIFF*/
	};
});
