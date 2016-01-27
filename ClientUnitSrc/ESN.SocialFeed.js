define("SocialFeed", ["ESNConstants", "RightUtilities", "ESNFeedConfig", "ConfigurationEnums",
		"performancecountermanager", "SocialMessageViewModel", "SocialFeedUtilities", "SocialMentionUtilities",
		"ESNHtmlEditModule", "MultilineLabel", "css!HtmlEditModule", "css!MultilineLabel"],
	function(ESNConstants, RightUtilities, ESNFeedConfig, ConfigurationEnums, performanceManager) {
		return {
			mixins: {
				SocialFeedUtilities: "Terrasoft.SocialFeedUtilities",
				SocialMentionUtilities: "Terrasoft.SocialMentionUtilities"
			},
			messages: {
				/**
				 * @message ChannelSaved
				 * Сообщает модулю о сохранении канала.
				 */
				"ChannelSaved": {
					mode: Terrasoft.MessageMode.BROADCAST,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				},

				/**
				 * @message RemoveChannel
				 * Сообщает модулю об удалении канала.
				 */
				"RemoveChannel": {
					mode: Terrasoft.MessageMode.BROADCAST,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				},

				/**
				 * @message EntityInitialized
				 * Запускается после инициализации объекта и информирует подписчиков о завершении инициализации
				 * сущности. В качестве параметра сообщения передается информация о объекте.
				 */
				"EntityInitialized": {
					mode: Terrasoft.MessageMode.BROADCAST,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				}
			},
			attributes: {

				/**
				 *
				 */
				"maskVisible": {
					"type": this.Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"dataValueType": this.Terrasoft.DataValueType.BOOLEAN,
					"value": false
				},

				/**
				* Сообщения.
				*/
				posts: {
					"dataValueType": Terrasoft.DataValueType.ENUM,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
				},

				/**
				 * True, если элемент управления для отображения сообщений работает в асинхронном режиме.
				 */
				"IsContainerListAsync": {
					"dataValueType": Terrasoft.DataValueType.BOOLEAN,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": true
				},

				/**
				 * Название колонки сортировки.
				 */
				sortColumnName: {
					"dataValueType": Terrasoft.DataValueType.TEXT,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": "CreatedOn"
				},

				/**
				 * Значение колонки по которой происходит сортировка при постраничном выводе.
				 */
				sortColumnLastValue: {
					"dataValueType": Terrasoft.DataValueType.DATE_TIME,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
				},

				/**
				 * Значение публикуемого сообщения.
				 */
				"SocialMessageText": {
					"dataValueType": Terrasoft.DataValueType.TEXT,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": ""
				},

				/**
				 * Каналы доступные для публикации.
				 */
				channels: {
					"dataValueType": Terrasoft.DataValueType.COLLECTION,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
				},

				/**
				 * Каналы доступные для публикации.
				 */
				entitiesList: {
					"dataValueType": Terrasoft.DataValueType.COLLECTION,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
				},

				channel: {
					"dataValueType": Terrasoft.DataValueType.ENUM,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": ""
				},

				/**
				* True, если запущена публикация сообщения.
				*/
				isPosting: {
					"dataValueType": Terrasoft.DataValueType.BOOLEAN,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": false
				},

				/**
				* True, если кнопка отображения новых сообщений видима.
				*/
				showNewSocialMessagesVisible: {
					"dataValueType": Terrasoft.DataValueType.BOOLEAN,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": false
				},

				/**
				* Количество новых сообщений.
				* @type {Number}
				*/
				newSocialMessagesCount: {
					"dataValueType": Terrasoft.DataValueType.INTEGER,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": 0
				},

				/**
				 * True, если элемент управления выбора канала включен.
				 * @type {Boolean}
				 */
				ChannelEditEnabled: {
					"dataValueType": Terrasoft.DataValueType.BOOLEAN,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": false
				},

				/**
				 * True, если элемент управления выбора канала видим.
				 * @type {Boolean}
				 */
				ChannelEditVisible: {
					"dataValueType": Terrasoft.DataValueType.BOOLEAN,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": false
				},

				/**
				 * True, если элемент управления выбора канала активен.
				 * @type {Boolean}
				 */
				ChannelEditFocused: {
					"dataValueType": Terrasoft.DataValueType.BOOLEAN,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": false
				},

				/**
				* Идентификатор схемы сущности.
				*/
				entitySchemaUId: {
					"dataValueType": Terrasoft.DataValueType.TEXT,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": ESNConstants.ESN.SocialChannelSchemaUId
				},

				/**
				* Название схемы сущности.
				* @type {String}
				*/
				entitySchemaName: {
					"dataValueType": Terrasoft.DataValueType.TEXT,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": "SocialChannel"
				},

				/**
				*
				*/
				postPublishActionsVisible: {
					"dataValueType": Terrasoft.DataValueType.BOOLEAN,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": false
				},

				/**
				* True, если контейнер элементов ввода сообщения и выбора канала видим.
				* @type {Boolean}
				*/
				ESNFeedHeaderVisible: {
					"dataValueType": Terrasoft.DataValueType.BOOLEAN,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": true
				},

				/**
				* Идентификатор модуля находящегося в разделе.
				* @type {String}
				*/
				ESNSectionSandboxId: {
					"dataValueType": Terrasoft.DataValueType.TEXT,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": "SectionModuleV2_ESNFeedSectionV2_ESNFeed"
				},

				/**
				* Идентификатор модуля находящегося в коммуникационной панели.
				* @type {String}
				*/
				ESNRightPanelSandboxId: {
					"dataValueType": Terrasoft.DataValueType.TEXT,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": "ViewModule_RightSideBarModule_ESNFeedModule"
				},

				/**
				* Количество сообщений, загружаемых сразу.
				* @private
				*/
				InitMessageCount: {
					"dataValueType": Terrasoft.DataValueType.INTEGER,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": 15
				},

				/**
				* Количество сообщений, догружаемых при прокрутке.
				* @private
				*/
				NextMessageCount: {
					"dataValueType": Terrasoft.DataValueType.INTEGER,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": 15
				},

				/**
				* Список каналов с признаком
				* "Только пользователи с правом на изменение могут публиковать сообщения", доступных пользователю
				* для публикации.
				* @type {Object}
				*/
				ColumnList: {
					"dataValueType": Terrasoft.DataValueType.CUSTOM_OBJECT,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": null
				},

				/**
				* Список каналов с признаком "Все пользователи могут публиковать сообщения",
				* доступных пользователю для публикации.
				* @type {Object}
				*/
				SharedColumnList: {
					"dataValueType": Terrasoft.DataValueType.CUSTOM_OBJECT,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": null
				},

				/**
				* Массив идентификаторов каналов с признаком "Все пользователи могут публиковать сообщения",
				* доступных пользователю для публикации.
				* @type {Array}
				*/
				SharedColumnIdList: {
					"dataValueType": Terrasoft.DataValueType.CUSTOM_OBJECT,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": null
				},

				/**
				* Массив идентификаторов с признаком "Только пользователи с правом на изменение могут публиковать
				* сообщения", доступных пользователю для публикации.
				* @type {Array}
				*/
				ColumnIdList: {
					"dataValueType": Terrasoft.DataValueType.CUSTOM_OBJECT,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": null
				},

				/**
				* Идентификатор активного (видимого) сообщения.
				* @type {String}
				*/
				ActiveSocialMessageId: {
					"dataValueType": Terrasoft.DataValueType.TEXT,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": ""
				},

				/**
				* Варианты сортировки сообщений.
				* @type {Array}
				* @private
				*/
				SocialMessageSortColumns: {
					"dataValueType": Terrasoft.DataValueType.CUSTOM_OBJECT,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": [
						"CreatedOn",
						"LastActionOn"
					]
				}
			},

			methods: {

				/**
				 * Инициализирует модель представления.
				 * @param {Function} callback
				 * @param {Object} scope
				 */
				init: function(callback, scope) {
					performanceManager.start(this.sandbox.id + "_ESNInit");
					this.callParent([function() {
						this.mixins.SocialFeedUtilities.init.call(this);
						this.mixins.SocialMentionUtilities.init.call(this);
						this.initCollections();
						this.initChannelsList();
						this.subscribeSandboxEvents();
						this.Terrasoft.ServerChannel.on(this.Terrasoft.EventName.ON_MESSAGE,
								this.onSocialMessageReceived, this);
						performanceManager.stop(this.sandbox.id + "_ESNInit");
						callback.call(scope);
					}, this]);
				},

				/**
				 * Инициализирует коллекции модели представления.
				 * @private
				 */
				initCollections: function() {
					this.initCollection("SocialMessages");
					this.initCollection("channels");
					this.initCollection("entitiesList");
				},

				/**
				 * Инициализирует коллекцию модели представления.
				 * @private
				 * @param {String} collectionName Название коллекции.
				 */
				initCollection: function(collectionName) {
					var collection = this.get(collectionName);
					if (!collection) {
						collection = this.Ext.create("Terrasoft.Collection");
						this.set(collectionName, collection);
					} else {
						collection.clear();
					}
				},

				/**
				 * Возвращает информацию о текущей записи.
				 * @return {Object} Информация о текущей записи.
				 */
				getRecordInfo: function() {
					return this.sandbox.publish("GetRecordInfo", null, [this.sandbox.id]);
				},

				/**
				 * Инициализирует модель представления при изменении страницы записи, в которую загружен модуль.
				 * @param {Object} config Параметры загрузки.
				 * @param {Object} config.activeSocialMessageId Идентификатор сообщения, которое необходимо сделать
				 * активным.
				 */
				initModuleViewModel: function(config) {
					this.activeSocialMessageId = config.activeSocialMessageId;
					var recordInfo = this.getRecordInfo();
					this.setDefaultValues(recordInfo);
					this.initCurrentChannel(recordInfo);
					this.init(this.loadInitialSocialMessages, this);
				},

				/**
				 * @inheritdoc
				 * @overridden
				 */
				subscribeSandboxEvents: function() {
					this.sandbox.subscribe("InitModuleViewModel", this.initModuleViewModel, this, [this.sandbox.id]);
					this.sandbox.subscribe("CardSaved", this.onCardSaved, this, [this.sandbox.id]);
					this.sandbox.subscribe("EntityInitialized", this.onChannelInitialized, this, [this.sandbox.id]);
					this.sandbox.subscribe("RemoveChannel", this.onRemoveChannel, this);
					this.sandbox.subscribe("ChannelSaved", this.onChannelSaved, this);
				},

				/**
				 * Устанавливает текущий канал.
				 * @protected
				 * @param {Object} channelInfo Информация о текущем канале.
				 * @param {String} channelInfo.primaryColumnValue Идентификатор текущего канала.
				 * @param {String} channelInfo.primaryDisplayColumnValue Название текущего канала.
				 */
				onChannelInitialized: function(channelInfo) {
					var recordInfo = {
						channelId: channelInfo.primaryColumnValue,
						channelName: channelInfo.primaryDisplayColumnValue
					};
					this.setSocialChannel(recordInfo);
				},

				/**
				 * Добавляет или обновляет канал в список каналов в ленте.
				 * @protected
				 * @param {Terrasoft.BaseViewModel} result Канал, который нужно добавить или обновить.
				 */
				onChannelSaved: function(result) {
					var value = result.get("value");
					var columnList = this.get("ColumnList");
					var columnIdList = this.get("ColumnIdList");
					var sharedColumnList = this.get("SharedColumnList");
					var sharedColumnIdList = this.get("SharedColumnIdList");
					if (!result.get("isNew")) {
						delete columnList[value];
						this.Ext.Array.remove(columnIdList, value);
						delete sharedColumnList[value];
						this.Ext.Array.remove(sharedColumnIdList, value);
						this.updateChannel(result);
					}
					if (!result.get("PublisherRightKind")) {
						if (!this.Ext.Array.contains(columnIdList, value)) {
							this.addChannelToChannelList(columnList, result);
							columnIdList.push(value);
							columnIdList.sort(this.sortByDisplayValue.bind(this, columnList));
						}
					} else {
						if (!this.Ext.Array.contains(sharedColumnIdList, value)) {
							this.addChannelToChannelList(sharedColumnList, result);
							sharedColumnIdList.push(value);
							sharedColumnIdList.sort(this.sortByDisplayValue.bind(this, sharedColumnList));
						}
					}
					RightUtilities.checkCanReadRecords({
						schemaName: "SocialChannel",
						primaryColumnValues: sharedColumnIdList
					}, this.loadChannelListCallback.bind(this, false), this);
				},

				/**
				 * Обновляет канал.
				 * @protected
				 * @param {Terrasoft.BaseViewModel} result Канал, который нужно обновить.
				 */
				updateChannel: function(result) {
					var value = result.get("value");
					var currentChannel = this.get("SocialChannel");
					var editChannel = {
						channelId: value,
						channelName: result.get("displayValue"),
						primaryImageValue: result.get("primaryImageValue")
					};
					if (currentChannel && currentChannel.value === value) {
						this.setSocialChannel(editChannel);
						this.saveCurrentChannelToProfile();
					}
					this.updatePosts([value], editChannel);
				},

				/**
				 * Функция сортировки каналов в ленте.
				 * Каналы сортируются по названию по убыванию.
				 * @private
				 * @param {Object} list Список каналов.
				 * @param {String} keyA Первый ключ пары для сравнения.
				 * @param {String} keyB Второй ключ пары для сравнения.
				 * @return {Number} Возвращает -1, если название по первому
				 * ключу больше, чем по второму;
				 * возвращает 1, если displayValue по первому ключу меньше, чем по второму;
				 * возвращает 0, если значения равны.
				 */
				sortByDisplayValue: function(list, keyA, keyB) {
					var itemA = list[keyA];
					var itemB = list[keyB];
					if (itemA.displayValue > itemB.displayValue) {
						return -1;
					}
					if (itemA.displayValue < itemB.displayValue) {
						return 1;
					}
					return 0;
				},

				/**
				 * Удаляет каналы из списка каналов ленты.
				 * @protected
				 * @param {Array} result Список идентификаторов удаленных каналов.
				 */
				onRemoveChannel: function(result) {
					var channels = this.get("resultChannelColumnList");
					var columnList = this.get("ColumnList");
					var columnIdList = this.get("ColumnIdList");
					var sharedColumnList = this.get("SharedColumnList");
					var sharedColumnIdList = this.get("SharedColumnIdList");
					var currentChannel = this.get("SocialChannel");
					var deletedChannels = result.deletedItems;
					if (currentChannel && this.Ext.Array.contains(deletedChannels, currentChannel.value)) {
						this.set("SocialChannel", null);
						this.clearUserProfile();
					}
					deletedChannels.forEach(function(channelId) {
						delete columnList[channelId];
						this.Ext.Array.remove(columnIdList, channelId);
						delete sharedColumnList[channelId];
						this.Ext.Array.remove(sharedColumnIdList, channelId);
						delete channels[channelId];
					});
					this.updatePosts(deletedChannels);
				},

				/**
				 * Чистит профиль пользователя, который хранит последний канал,
				 * с которого публиковалось сообщение.
				 * @private
				 */
				clearUserProfile: function() {
					var profileKey = this.getProfileKey();
					this.Terrasoft.saveUserProfile(profileKey, undefined, false);
				},

				/**
				 * Обновляет те посты, которые были опубликованы со списка каналов.
				 * @private
				 * @param {Array} channels Список каналов.
				 * @param {Object} [channel] Канал, данные которого изменились.
				 */
				updatePosts: function(channels, channel) {
					var posts = this.get("SocialMessages");
					var filterPosts = posts.filterByFn(this.postsFilterFn.bind(this, channels), this);
					if (channel) {
						filterPosts.each(function(post) {
							delete post.EntitiesCache[channel.channelId];
							var entity = this.Terrasoft.deepClone(post.get("Entity"));
							entity.displayValue = channel.channelName;
							if (channel.primaryImageValue) {
								entity.primaryImageValue = channel.primaryImageValue;
							}
							post.set("Entity", entity);
						}, this);
					} else {
						filterPosts.each(function(post) {
							post.set("Entity", undefined);
						}, this);
					}
				},

				/**
				 * Фильтрует посты по списку каналов, которые были удалены.
				 * @private
				 * @param {Array} channels Список каналов.
				 * @param {Terrasoft.SocialMessageViewModel} post Пост в ленте.
				 * @return {Boolean} True, если пост был опубликован в одном из
				 * каналов, иначе False.
				 */
				postsFilterFn: function(channels, post) {
					var channel = post.get("Entity");
					return !this.Ext.isEmpty(channel) && this.Ext.Array.contains(channels, channel.value);
				},

				/**
				 * Обрабатывает событие сохранения страницы записи, в которую загружен модуль.
				 * @private
				 */
				onCardSaved: function() {
					var recordInfo = this.getRecordInfo();
					this.initCurrentChannel(recordInfo);
					this.publishSocialMessage();
				},

				/**
				 * @inheritdoc Terrasoft.BaseSchemaViewModel#onRender
				 * @overridden
				 */
				onRender: function() {
					var recordInfo = this.getRecordInfo();
					this.setDefaultValues(recordInfo);
					this.initCanDeleteAllMessageComment();
					var isNewRecord = this.getIsNewRecord();
					if (isNewRecord) {
						return;
					}
					this.initCurrentChannel(recordInfo);
					this.initPostMessageFocusedState();
					var socialMessages = this.get("SocialMessages");
					if (!socialMessages.getCount()) {
						this.initMessagesNumberEverySearchIteration(this.loadInitialSocialMessages, this);
					}
				},

				/**
				 * Инициализирует количество сообщений для итерации поиска.
				 * @param {Function} callback Функция обратного вызова.
				 * @param {Object} scope Контекст вызова функции обратного вызова.
				 */
				initMessagesNumberEverySearchIteration: function(callback, scope) {
					this.Terrasoft.SysSettings.querySysSettingsItem("MessagesNumberEverySearchIteration",
							function(value) {
								this.set("MessagesNumberEverySearchIteration", value);
								callback.call(scope);
							}, this);
				},

				/**
				 * Устанавливает значения по умолчанию.
				 * @private
				 * @param {Object} recordInfo Инфорация о записи, для которой отображается Лента.
				 */
				setDefaultValues: function(recordInfo) {
					this.set("ChannelEditVisible", false);
					this.set("ActiveSocialMessageId", "");
					if (!recordInfo) {
						return;
					}
					var channelId = recordInfo.channelId;
					var publisherRightKind = recordInfo.publisherRightKind;
					var channelFilter =
						this.Terrasoft.createColumnFilterWithParameter(this.Terrasoft.ComparisonType.EQUAL, "EntityId",
							channelId);
					this.set("channelFilter", channelFilter);
					this.set("entitySchemaUId", recordInfo.entitySchemaUId);
					this.set("entitySchemaName", recordInfo.entitySchemaName);
					this.set("sortColumnLastValue", null);
					if (!publisherRightKind && (recordInfo.entitySchemaName === "SocialChannel")) {
						RightUtilities.checkCanEdit({
							schemaName: recordInfo.entitySchemaName,
							primaryColumnValue: channelId,
							isNew: false
						}, function(result) {
							if (!this.Ext.isEmpty(result)) {
								this.setESNFeedHeaderVisible(false);
							} else {
								this.setESNFeedHeaderVisible(true);
							}
						}, this);
					} else {
						this.setESNFeedHeaderVisible(true);
					}
				},

				/**
				 * Инициализирует значение свойства "canDeleteAllMessageComment".
				 * @private
				 */
				initCanDeleteAllMessageComment: function() {
					var config = {
						operation: "CanDeleteAllMessageComment"
					};
					RightUtilities.checkCanExecuteOperation(config, function(result) {
						this.set("canDeleteAllMessageComment", result);
					}, this);
				},

				/**
				 * Инициализирует свойства текущего канала.
				 * @private
				 * @param {Object} recordInfo Информация о канале.
				 * @param {Object} recordInfo.channelId Идентификатор канала.
				 */
				initCurrentChannel: function(recordInfo) {
					var channelId = recordInfo ? recordInfo.channelId : null;
					if (!channelId) {
						this.loadProfile(function(profile) {
							if (!profile) {
								return;
							}
							this.set("SocialChannel", profile.channel);
						}, this);
					} else {
						this.setSocialChannel(recordInfo);
					}
				},

				/**
				 * Сохраняет текущий канал в профиль.
				 * @private
				 */
				saveCurrentChannelToProfile: function() {
					var channel = this.get("SocialChannel");
					if (!channel) {
						return;
					}
					var recordInfo = this.getRecordInfo();
					if (recordInfo && recordInfo.channelId) {
						return;
					}
					var profileKey = this.getProfileKey();
					this.Terrasoft.saveUserProfile(profileKey, {
						channel: channel
					}, false);
				},

				/**
				 * @inheritDoc Terrasoft.BaseSchemaViewModel#getProfileKey
				 * @overridden
				 */
				getProfileKey: function() {
					var profileKey = this.callParent(arguments);
					if (profileKey) {
						profileKey += "_";
					}
					profileKey += this.name;
					return profileKey;
				},

				/**
				 * Загружает профиль.
				 * @private
				 */
				loadProfile: function(callback, scope) {
					var profileKey = this.getProfileKey();
					this.Terrasoft.require(["profile!" + profileKey], callback, scope);
				},

				/**
				 * Инициализирует список каналов, доступных для публикации пользователю.
				 * @private
				 */
				initChannelsList: function() {
					var esq = this.getSocialChannelSelectQuery();
					esq.getEntityCollection(function(response) {
						if (!response.success) {
							return;
						}
						var list = this.get("channels");
						list.clear();
						var columnIdList = [];
						var sharedColumnIdList = [];
						var columnList = {};
						var sharedColumnList = {};
						this.set("ColumnIdList", columnIdList);
						this.set("SharedColumnIdList", sharedColumnIdList);
						this.set("ColumnList", columnList);
						this.set("SharedColumnList", sharedColumnList);
						var items = response.collection.getItems();
						this.Terrasoft.each(items, function(item) {
							if (!item.get("PublisherRightKind")) {
								this.addChannelToChannelList(columnList, item);
								columnIdList.push(item.get("value"));
							} else {
								this.addChannelToChannelList(sharedColumnList, item);
								sharedColumnIdList.push(item.get("value"));
							}
						}, this);
						RightUtilities.checkCanReadRecords({
							schemaName: "SocialChannel",
							primaryColumnValues: sharedColumnIdList
						}, this.loadChannelListCallback.bind(this, true), this);
					}, this);
				},

				/**
				 * Добавляет канал в список.
				 * @param {Object} channelListObject
				 * @param {Terrasoft.BaseViewModel} channel
				 */
				addChannelToChannelList: function(channelListObject, channel) {
					channelListObject[channel.get("value")] = {
						value: channel.get("value"),
						displayValue: channel.get("displayValue"),
						primaryImageValue: channel.get("primaryImageValue")
					};
				},

				/**
				 * Загружает каналы, доступные пользователю.
				 * @private
				 * @param {Boolean} loadImmediately Загружать ли список каналов сразу.
				 * @param {Array} result Список каналов.
				 */
				loadChannelListCallback: function(loadImmediately, result) {
					var items = result;
					var list = this.get("channels");
					var sharedResultColumnList = {};
					var resultColumnList = {};
					this.Terrasoft.each(items, function(item) {
						var itemKey = item.Key;
						var sharedColumnList = this.get("SharedColumnList");
						if (item.Value && sharedColumnList[itemKey]) {
							sharedResultColumnList[itemKey] = sharedColumnList[itemKey];
						}
					}, this);
					RightUtilities.checkCanEditRecords({
						schemaName: "SocialChannel",
						primaryColumnValues: this.get("ColumnIdList")
					}, function(result) {
						items = result;
						this.Terrasoft.each(items, function(item) {
							var itemKey = item.Key;
							var columnList = this.get("ColumnList");
							if (item.Value && columnList[itemKey]) {
								resultColumnList[itemKey] = columnList[itemKey];
							}
						}, this);
						resultColumnList = this.mergeObjectProperties(resultColumnList, sharedResultColumnList);
						if (loadImmediately) {
							list.loadAll(resultColumnList);
						}
						this.set("resultChannelColumnList", resultColumnList);
						var esnRightPanelSandboxId = this.get("ESNRightPanelSandboxId");
						var esnSectionSandboxId = this.get("ESNSectionSandboxId");
						var sandboxId = this.sandbox.id;
						if (sandboxId === esnRightPanelSandboxId || sandboxId === esnSectionSandboxId) {
							this.set("ChannelEditEnabled", true);
						}
					}, this);
				},

				/**
				 * Выполняет поверхностное копирование свойств объектов.
				 * @private
				 * @return {Object} Объект, содержащий свои свойства + свойства всех остальных переданных в
				 * параметрах объектов.
				 */
				mergeObjectProperties: function() {
					var objects = [].slice.call(arguments, 1);
					var resultObject = arguments[0];
					this.Terrasoft.each(objects, function(obj) {
						for (var prop in obj) {
							if (obj.hasOwnProperty(prop) && !resultObject[prop]) {
								resultObject[prop] = obj[prop];
							}
						}
					}, this);
					return resultObject;
				},

				/**
				 * Устанавливает текущий канал.
				 * @private
				 * @param {Object} recordInfo
				 */
				setSocialChannel: function(recordInfo) {
					this.set("SocialChannel", {
						value: recordInfo.channelId,
						displayValue: recordInfo.channelName
					});
				},

				/**
				 * Обработчик события получения сообщения об изменении сообщения.
				 * @private
				 * @param {Object} config Конфигурационный объект.
				 */
				onUpdateSocialMessageReceived: function(config) {
					var posts = this.get("SocialMessages");
					if (!posts.contains(config.response.Id)) {
						return;
					}
					this.loadSocialMessages(config.loadSocialMessagesConfig,
						config.loadSocialMessagesCallback, this);
				},

				/**
				 * Обработчик события получения сообщения о добавлении нового сообщения.
				 * @private
				 * @param {Object} config Конфигурационный объект.
				 */
				onInsertSocialMessageReceived: function(config) {
					var receivedMessage = this.Ext.decode(config.response.Body);
					if (this.get("channelFilter")) {
						if (receivedMessage.channelId === this.get("channelFilter").rightExpression.parameterValue) {
							if (this.Terrasoft.SysValue.CURRENT_USER.value === receivedMessage.sysAdminUnitId) {
								this.loadSocialMessages(config.loadSocialMessagesConfig,
									config.loadSocialMessagesCallback, this);
							} else {
								this.showLoadNewMessageButton();
							}
						}
					} else {
						if (this.Terrasoft.SysValue.CURRENT_USER.value !== receivedMessage.sysAdminUnitId) {
							this.showLoadNewMessageButton();
						} else {
							this.loadSocialMessages(config.loadSocialMessagesConfig, config.loadSocialMessagesCallback,
								this);
						}
					}
				},

				/**
				 * Показывает кнопку "Показать n новых сообщений".
				 * @private
				 */
				showLoadNewMessageButton: function() {
					var newSocialMessagesCount = this.get("newSocialMessagesCount");
					this.set("newSocialMessagesCount", newSocialMessagesCount + 1);
					this.set("showNewSocialMessagesVisible", true);
					var postContainer = this.Ext.get(this.sandbox.id + "_postPublish-container");
					if (postContainer && window.scrollY > postContainer.getHeight()) {
						var newMessageContainer = this.Ext.get(this.sandbox.id + "_showNewMessage-container");
						newMessageContainer.addCls("showNewMessageContainer-scroll");
						var newMsgPaddingContainer = this.Ext.get(this.get("ESNSectionSandboxId") +
							"_showNewMessagePadding-container");
						newMsgPaddingContainer.addCls("showNewMessagePadding-scroll");
					} else if (this.sandbox.id === this.get("ESNRightPanelSandboxId") && postContainer) {
						var postList = Ext.get(this.sandbox.id + "_postList-container");
						postList.addCls("showNewMessageContainerTop");
						if (this.get("ChannelEditVisible")) {
							postList.addCls("headerWithChannelListAndMessageTop");
						}
					}
				},

				/**
				 * Задает вопрос пользователю о необходимости продолжить загрузку сообщений.
				 * @private
				 * @param {Number} count
				 * @param {Function} callback
				 * @param {Object} scope
				 */
				promtLoadMoreMessages: function(count, callback, scope) {
					var template = this.get("Resources.Strings.MaxMessagesNumberPerSearchIterationReached");
					var message = this.Ext.String.format(template, count);
					this.showConfirmationDialog(message, function(result) {
						if (result !== this.Terrasoft.MessageBoxButtons.YES.returnCode) {
							return;
						}
						callback.call(scope);
					}, ["yes", "no"]);
				},

				/**
				 * Обработчик завершения процесса загрузки сообщений.
				 * @private
				 * @param {Terrasoft.BaseViewModel} item
				 */
				loadSocialMessagesCallback: function(item) {
					var posts = this.get("SocialMessages");
					var editedPostId = item.get("Id");
					if (!posts.contains(editedPostId)) {
						return;
					}
					var editedPost = posts.get(editedPostId);
					editedPost.setColumnValues(item);
				},

				/**
				 * Обработчик завершения процесса удаления сообщения.
				 * @private
				 */
				onDeleteRecordCallback: function() {
					var postToDeleteId = this.get("Id");
					if (this.Ext.isEmpty(this.get("Parent"))) {
						var posts = this.get("SocialMessages");
						posts.removeByKey(postToDeleteId);
					}
				},

				/**
				 * Обработчик события получения нового сообщения.
				 * @param {Object} scope
				 * @param {Object} response
				 */
				onSocialMessageReceived: function(scope, response) {
					if (response && response.Header.Sender !== "UpdateSocialMessage") {
						return;
					}
					var receivedMessage = this.Ext.decode(response.Body);
					var loadSocialMessagesConfig = {
						id: response.Id,
						sandbox: this.sandbox,
						canDeleteAllMessageComment: this.get("canDeleteAllMessageComment"),
						onDeleteRecordCallback: this.onDeleteRecordCallback
					};
					var config = {
						response: response,
						loadSocialMessagesConfig: loadSocialMessagesConfig,
						loadSocialMessagesCallback: this.loadSocialMessagesCallback
					};
					switch (receivedMessage.operation) {
						case "insert":
							this.onInsertSocialMessageReceived(config);
							break;
						case "update":
							this.onUpdateSocialMessageReceived(config);
							break;
						case "delete":
							var posts = this.get("SocialMessages");
							posts.removeByKey(response.Id);
							break;
					}
				},

				/**
				 * Инциализирует свойство "focused" элемента ввода сообщения.
				 * @private
				 */
				initPostMessageFocusedState: function() {
					if (this.sandbox.id === this.get("ESNSectionSandboxId")) {
						var state = this.sandbox.publish("GetHistoryState");
						if (state && state.state && state.state.focusAddPost === true) {
							this.onSocialMessageEditFocus();
						}
					}
				},

				/**
				 * Функция дозагрузки сообщений.
				 * @private
				 */
				onLoadNext: function() {
					setTimeout(function() {
						var channelFilter = this.get("channelFilter");
						var nextMessageCount = this.get("NextMessageCount");
						if (channelFilter) {
							this.loadPosts(nextMessageCount, channelFilter);
						} else {
							this.loadPosts(nextMessageCount);
						}
					}.bind(this), 10);
				},

				/**
				 * Возвращает модифицированную конфигурацию записи.
				 * @protected
				 * @param {Object} itemConfig конфигурация элемента
				 * @param {Terrasoft.BaseViewModel} item запись элемент коллекции
				 */
				getItemViewConfig: function(itemConfig, item) {
					var entitySchemaUId = item.get("EntitySchemaUId");
					var сolor = item.get("Color");
					var entityColor = this.getEntityColor(entitySchemaUId, сolor);
					var borderColorStyle = {
						wrapStyles: {
							"border-left-color": entityColor
						}
					};
					itemConfig.config = ESNFeedConfig.postConfig;
					var postWrapper = itemConfig.config.items[0];
					if (postWrapper.hasOwnProperty("styles")) {
						postWrapper.styles = Ext.Object.merge(postWrapper.styles, borderColorStyle);
					} else {
						postWrapper.styles = borderColorStyle;
					}
					var commentWrapper = itemConfig.config.items[1];
					if (commentWrapper.hasOwnProperty("styles")) {
						commentWrapper.styles = Ext.Object.merge(commentWrapper.styles, borderColorStyle);
					} else {
						commentWrapper.styles = borderColorStyle;
					}
				},

				/**
				 * Возвращает изображение выбранного канала.
				 * @private
				 * return {String}
				 */
				getChannelImage: function() {
					var channel = this.get("SocialChannel");
					return this.Ext.isEmpty(channel)
						? this.Terrasoft.ImageUrlBuilder.getUrl(this.get("Resources.Strings.NoChannel"))
						: this.getImageValue(channel);
				},

				/**
				 * Проверяет права пользователя на создание/изменение каналов.
				 * @private
				 */
				onChannelPrepareList: function() {
					RightUtilities.getSchemaEditRights({schemaName: "SocialChannel"}, function(result) {
						if (!this.Ext.isEmpty(result)) {
							RightUtilities.getSchemaReadRights({
								schemaName: "SocialChannel"
							}, function(result) {
								if (this.Ext.isEmpty(result)) {
									var filter =
										this.Terrasoft.createColumnFilterWithParameter(
											Terrasoft.ComparisonType.EQUAL, "PublisherRightKind", 1);
									this.prepareChannels(this, filter);
								}
							}, this);
						} else {
							this.prepareChannels();
						}
					}, this);
				},

				/**
				 * Возвращает название канала.
				 * @private
				 * @return {String} Название канала.
				 */
				getChannelText: function() {
					var channel = this.get("SocialChannel");
					return !this.Ext.isEmpty(channel)
						? channel.displayValue
						: this.get("Resources.Strings.SelectChannelHint");
				},

				/**
				 * Публикует сообщение.
				 * @private
				 */
				publishSocialMessage: function() {
					if (!this.validateNewSocialMessageData()) {
						return;
					}
					var socialMessageData = this.getNewSocialMessageData();
					this.insertSocialMessage(socialMessageData, this.socialMessageInserted, this);
					this.clearSocialMessageText();
					this.updateSubscribeAction();
					this.saveCurrentChannelToProfile();
				},

				/**
				 * Возвращает информацию о новом сообщении.
				 * @private
				 * @return {Object} Информация о новом сообщении.
				 */
				getNewSocialMessageData: function() {
					var socialChannel = this.get("SocialChannel");
					return {
						entitySchemaId: this.get("entitySchemaUId"),
						entityId: socialChannel.value,
						message: this.get("SocialMessageText"),
						sandbox: this.sandbox
					};
				},

				/**
				 * Обрабатывает событие вставки сообщения в базу данных.
				 * @private
				 * @param {Terrasoft.BaseViewModel} socialMessage Сообщение.
				 */
				socialMessageInserted: function(socialMessage) {
					var socialMessages = this.get("SocialMessages");
					var messageId = socialMessage.get("Id");
					if (!socialMessages.contains(messageId)) {
						socialMessages.insert(0, messageId, socialMessage);
					}
				},

				/**
				 * Обновляет информацию о подписке на текущую запись на странице, в которую загружен модуль.
				 * @private
				 */
				updateSubscribeAction: function() {
					this.sandbox.publish("UpdateSubscribeAction", {
						isSubscribed: true
					}, [this.sandbox.id.substring(0, this.sandbox.id.lastIndexOf("_"))]);
				},

				/**
				 * Очищает текст сообщения.
				 * @private
				 */
				clearSocialMessageText: function() {
					this.set("SocialMessageText", "");
				},

				/**
				 * Обрабатывает нажатие на кнопку "Опубликовать".
				 * @private
				 */
				onPostPublishClick: function() {
					var isNewRecord = this.getIsNewRecord();
					if (!isNewRecord) {
						this.publishSocialMessage();
					} else {
						var config = {
							scope: this,
							isSilent: true,
							subscribeOwner: false,
							messageTags: [this.sandbox.id]
						};
						this.sandbox.publish("SaveRecord", config, [this.sandbox.id]);
					}
				},

				/**
				 * Обрабатывает событие "focus" элемента управления, который хранит значение публикуемого сообщения.
				 * @private
				 */
				onSocialMessageEditFocus: function() {
					this.set("ChannelEditVisible", true);
					this.set("postPublishActionsVisible", true);
				},

				/**
				 * Обрабатывает событие "blur" элемента управления, который хранит значение публикуемого сообщения.
				 * @private
				 */
				onSocialMessageEditBlur: function() {
					var setDataTask = new Ext.util.DelayedTask(function() {
						var postMessage = this.get("SocialMessageText");
						var channelEditFocused = this.get("ChannelEditFocused");
						var isValid = this.validate();
						if (postMessage || channelEditFocused || !isValid) {
							return;
						}
						this.set("ChannelEditVisible", false);
						this.set("postPublishActionsVisible", false);
					}, this);
					setDataTask.delay(300);
				},

				/**
				 * Обрабатывает событие "blur" элемента управления, который хранит значение канала.
				 * @private
				 */
				onChannelEditBlur: function() {
					var postMessage = this.get("SocialMessageText");
					var channelEditFocused = this.get("ChannelEditFocused");
					var isValid = this.validate();
					if (postMessage || channelEditFocused || !isValid) {
						return;
					}
					this.set("ChannelEditVisible", false);
					this.set("postPublishActionsVisible", false);
				},

				/**
				 * Выполняет сортировку сообщений.
				 * @private
				 */
				onSortClick: function() {
					this.set("sortColumnLastValue", null);
					this.get("SocialMessages").clear();
					var channelFilter = this.get("channelFilter");
					this.loadPosts(this.get("InitMessageCount"), channelFilter);
				},

				/**
				 * Обработчик нажатия на кнопку сортировки по дате последнего действия.
				 * @private
				 */
				onLastActionOnSortClick: function() {
					this.set("sortColumnName", this.get("SocialMessageSortColumns")[1]);
					this.onSortClick();
				},

				/**
				 * Обработчик нажатия на кнопку сортировки по дате сообщения.
				 * @private
				 */
				onCreatedOnSortClick: function() {
					this.set("sortColumnName", this.get("SocialMessageSortColumns")[0]);
					this.onSortClick();
				},

				/**
				 * Возвращает количество новых сообщений.
				 * @private
				 */
				getShowNewMessageText: function() {
					var newSocialMessagesCount = this.get("newSocialMessagesCount");
					if (newSocialMessagesCount === 0) {
						this.set("showNewSocialMessagesVisible", false);
					} else if (newSocialMessagesCount > 1) {
						return this.Ext.String.format(this.get("Resources.Strings.ShowMoreThanOneNewSocialMessages"),
							newSocialMessagesCount);
					} else {
						return this.get("Resources.Strings.ShowNewSocialMessage");
					}
				},

				/**
				 * Обработчик нажатия кнопки показа новых сообщений.
				 * @private
				 */
				onShowNewMessageClick: function() {
					this.set("sortColumnName", this.get("SocialMessageSortColumns")[0]);
					this.set("sortColumnLastValue", null);
					this.set("newSocialMessagesCount", 0);
					this.set("showNewSocialMessagesVisible", false);
					this.get("SocialMessages").clear();
					var newMessageContainer = this.Ext.get(this.get("ESNRightPanelSandboxId") + "_postList-container");
					if (newMessageContainer && this.sandbox.id === this.get("ESNRightPanelSandboxId")) {
						newMessageContainer.removeCls("showNewMessageContainerTop");
						newMessageContainer.removeCls("headerWithChannelListAndMessageTop");
					}
					var channelFilter = this.get("channelFilter");
					if (channelFilter) {
						this.loadPosts(this.get("InitMessageCount"), channelFilter);
					} else {
						this.loadPosts(this.get("InitMessageCount"));
					}
					this.Ext.getBody().dom.scrollTop = 0;
					this.Ext.getDoc().dom.documentElement.scrollTop = 0;
				},

				/**
				 * Загружает каналы.
				 */
				prepareChannels: function() {
					var list = this.get("channels");
					var resultChannelColumnList = this.get("resultChannelColumnList");
					list.clear();
					list.loadAll(resultChannelColumnList);
				},

				/**
				 * Обрабатывает событие "keydown" элемента ввода сообщения.
				 * @param {Ext.EventObjectImpl} e
				 */
				onKeyDown: function onKeyDown(e) {
					if (e.ctrlKey && (e.keyCode === e.ENTER)) {
						this.onPostPublishClick();
					}
				},

				/**
				 * Создаёт ESQ запрос на таблицу SocialChannel с целью получить упорядоченные по убыванию записи.
				 * @private
				 * @return {Terrasoft.EntitySchemaQuery}
				 */
				getSocialChannelSelectQuery: function() {
					var esq = this.Ext.create("Terrasoft.EntitySchemaQuery", {
						rootSchemaName: "SocialChannel"
					});
					esq.addColumn("PublisherRightKind");
					esq.addMacrosColumn(this.Terrasoft.QueryMacrosType.PRIMARY_COLUMN, "value");
					esq.addMacrosColumn(this.Terrasoft.QueryMacrosType.PRIMARY_IMAGE_COLUMN, "primaryImageValue");
					var displayColumn = esq.addMacrosColumn(this.Terrasoft.QueryMacrosType.PRIMARY_DISPLAY_COLUMN,
						"displayValue");
					displayColumn.orderPosition = 1;
					displayColumn.orderDirection = this.Terrasoft.OrderDirection.DESC;
					return esq;
				},

				/**
				 * Загружает сообщения.
				 * @private
				 * @param {Number} rowCount
				 * @param {Terrasoft.BaseFilter} filter
				 */
				loadPosts: function(rowCount, filter) {
					performanceManager.start(this.sandbox.id + "_LoadPosts");
					var config = {
						rowCount: rowCount,
						filter: filter
					};
					this.set("maskVisible", true);
					this.getNextMessages(config, function(messages) {
						this.set("maskVisible", false);
						this.get("SocialMessages").loadAll(messages);
						this.hideBodyMask();
						performanceManager.stop(this.sandbox.id + "_LoadPosts");
					}, this);
				},

				/**
				 * Получает следующие сообщения.
				 * @param {Object} config
				 * @param {Function} callback
				 * @param {Object} scope
				 */
				getNextMessages: function(config, callback, scope) {
					var viewModel = this;
					var canDeleteAllMessageComment = this.get("canDeleteAllMessageComment");
					var sortColumnName = this.get("sortColumnName");
					this.loadSocialMessages({
						sortColumnName: sortColumnName,
						sandbox: this.sandbox,
						esqConfig: {
							rowCount: config.rowCount,
							filter: config.filter
						},
						canDeleteAllMessageComment: canDeleteAllMessageComment,
						onDeleteRecordCallback: function() {
							var posts = viewModel.get("SocialMessages");
							var postToDeleteId = this.get("Id");
							posts.removeByKey(postToDeleteId);
						}
					}, function(messages) {
						callback.call(scope || this, messages);
					}, this);
				},

				/**
				 * Загружает сообщеня.
				 * @private
				 */
				loadInitialSocialMessages: function() {
					var activeSocialMessageId = this.activeSocialMessageId;
					if (!activeSocialMessageId) {
						this.loadInitial();
					} else {
						this.loadUntil(activeSocialMessageId);
					}
				},

				/**
				 * Загружает первичное количество сообщений.
				 * @private
				 */
				loadInitial: function() {
					var channelFilter = this.get("channelFilter");
					var initMessageCount = this.get("InitMessageCount");
					this.loadPosts(initMessageCount, channelFilter);
				},

				/**
				 * Загружает все сообщения до указанного.
				 * @private
				 * @param {String} messageId
				 */
				loadUntil: function(messageId) {
					var filter = this.get("channelFilter");
					var messagesNumberEverySearchIteration = this.get("MessagesNumberEverySearchIteration");
					var config = {
						rowCount: messagesNumberEverySearchIteration,
						filter: filter
					};
					this.set("IsContainerListAsync", false);
					this.showBodyMask();
					this.getNextMessages(config, function(messages) {
						var posts = this.get("SocialMessages");
						posts.loadAll(messages);
						this.set("IsContainerListAsync", true);
						this.hideBodyMask();
						if (posts.contains(messageId)) {
							this.set("ActiveSocialMessageId", messageId);
						} else {
							var messagesCount = messages.getCount();
							if (messagesCount > 0) {
								this.promtLoadMoreMessages(messagesCount, function() {
									this.loadUntil(messageId);
								}, this);
							}
						}
					}, this);
				},

				/**
				 * Устанавливает значение свойства "Видимость" элемента ввода сообщения.
				 * @private
				 */
				setESNFeedHeaderVisible: function(value) {
					this.set("ESNFeedHeaderVisible", value);
				},

				/**
				 *
				 */
				getSortButtonImageConfig: function() {
					return this.getResourceImageConfig("Resources.Images.Sort");
				},

				/**
				 *
				 */
				getShowNewMessagesButtonImageConfig: function() {
					return this.getResourceImageConfig("Resources.Images.More");
				},

				/**
				 * Возвращает группу фильтров сообщений каналов, на которые подписан текущий пользователь или группы,
				 * в которые он входит с учетом отписок.
				 * @private
				 * @return {Terrasoft.FilterGroup} Группа фильтров сообщений каналов.
				 */
				getCurrentUserPostsFilter: function() {
					var filterGroup = this.Ext.create("Terrasoft.FilterGroup");
					var currentUserId = this.Terrasoft.SysValue.CURRENT_USER.value;
					var socialSubscriptionPath = "[SocialSubscription:EntityId:EntityId]." +
						"[SysAdminUnitInRole:SysAdminUnitRoleId:SysAdminUnit].SysAdminUnit";
					var socialSubscription = this.Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
						socialSubscriptionPath, currentUserId);
					filterGroup.addItem(socialSubscription);
					var subFilterGroup = this.Ext.create("Terrasoft.FilterGroup");
					var socialUnsubscriptionPath = "[SocialUnsubscription:EntityId:EntityId].SysAdminUnit";
					var subFilter = this.Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
						socialUnsubscriptionPath, currentUserId);
					subFilterGroup.addItem(subFilter);
					var existsFilter = this.Terrasoft.createNotExistsFilter(socialUnsubscriptionPath, subFilterGroup);
					filterGroup.addItem(existsFilter);
					return filterGroup;
				},

				/**
				 * @inheritDoc Terrasoft.BaseSchemaViewModel#setValidationConfig
				 * @overridden
				 */
				setValidationConfig: function() {
					this.callParent(arguments);
					this.addColumnValidator("SocialChannel", this.validateChannel);
				},

				/**
				 * Валидирует информацию о новом сообщении.
				 * @return {Boolean} Результат валидации.
				 */
				validateNewSocialMessageData: function() {
					var textValidationResult = this.validateSocialMessageText();
					var channelValidationResult = this.validateChannel();
					return (textValidationResult.isValid && channelValidationResult.isValid);
				},

				/**
				 * Валидирует значение колонки "Текст сообщения".
				 * @private
				 * @return {Object} Результат валидации.
				 */
				validateSocialMessageText: function() {
					var result = {
						isValid: true,
						invalidMessage: ""
					};
					var messageText = this.get("SocialMessageText");
					if (messageText.length === 0) {
						result.isValid = false;
						result.invalidMessage = this.get("Resources.Strings.WritePostMessage");
					}
					return result;
				},

				/**
				 * Валидирует значение колонки "Канал".
				 * @private
				 * @return {Object} Результат валидации.
				 */
				validateChannel: function() {
					var result = {
						isValid: true,
						invalidMessage: ""
					};
					var channel = this.get("SocialChannel");
					if (this.Ext.isEmpty(channel)) {
						result.isValid = false;
						result.invalidMessage = this.get("Resources.Strings.SelectChannelMessage");
					}
					return result;
				},

				/**
				 * Возвращает значение DOM-атрибута data-item-marker элемента управления редактирования канала.
				 * @private
				 * @return {String} Значение DOM-атрибута data-item-marker элемента управления редактирования канала.
				 */
				getSocialMessageEditMarkerValue: function() {
					var caption = this.get("Resources.Strings.SelectChannelHint");
					return "SocialChannel" + " " + caption;
				},

				/**
				 * Очищает все подписки на события.
				 * @virtual
				 */
				destroy: function() {
					this.Terrasoft.ServerChannel.un(this.Terrasoft.EventName.ON_MESSAGE, this.onSocialMessageReceived,
						this);
					this.callParent(arguments);
				},

				/**
				 * Возвращает состояние карточки.
				 * @private
				 * @return {Boolean} True - новая запись.
				 */
				getIsNewRecord: function() {
					var cardState = this.sandbox.publish("GetCardState", null, [this.sandbox.id]);
					if (cardState) {
						return (cardState.state === ConfigurationEnums.CardStateV2.ADD ||
						cardState.state === ConfigurationEnums.CardStateV2.COPY);
					}
				},

				/**
				 * @inheritdoc Terrasoft.BasePageV2#subscribeViewModelEvents
				 * @overridden
				 */
				subscribeViewModelEvents: function() {
					this.callParent(arguments);
				},

				/**
				 * Возвращает заполнитель для поля выбора канана.
				 * @private
				 * @return {String} Заполнитель для поля выбора канана.
				 */
				getSocialChannelEditPlaceholder: function() {
					var isNewRecord = this.getIsNewRecord();
					var localizableStringName = isNewRecord ? "CurrentChannelHint" : "SelectChannelHint";
					return this.Ext.String.format(this.get("Resources.Strings." + localizableStringName));
				}
			},
			diff: [
				//SocialFeed
				{
					"operation": "insert",
					"name": "SocialFeed",
					"propertyName": "items",
					"values": {
						"generateId": false,
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"classes": {
							wrapClassName: ["feedWidth", "social-feed"]
						},
						"maskVisible": {bindTo: "maskVisible"},
						"items": []
					}
				},
				//SocialFeedHeader
				{
					"operation": "insert",
					"name": "SocialFeedHeader",
					"parentName": "SocialFeed",
					"propertyName": "items",
					"values": {
						"generateId": false,
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"classes": {
							wrapClassName: ["font", "social-feed-header"]
						},
						visible: {bindTo: "ESNFeedHeaderVisible"},
						"items": []
					}
				},
				//SocialMessageContainer
				{
					"operation": "insert",
					"name": "SocialMessageContainer",
					"parentName": "SocialFeedHeader",
					"propertyName": "items",
					"values": {
						"generateId": false,
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"classes": {
							wrapClassName: ["wide", "postPublish-container-margin"]
						},
						"items": []
					}
				},
				//SocialMessageEditContainer
				{
					"operation": "insert",
					"name": "SocialMessageEditContainer",
					"parentName": "SocialMessageContainer",
					"propertyName": "items",
					"values": {
						"generateId": false,
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"classes": {
							wrapClassName: ["social-message-edit-container"]
						},
						"items": []
					}
				},
				//SocialMessageEdit
				{
					"operation": "insert",
					"name": "SocialMessageEdit",
					"parentName": "SocialMessageEditContainer",
					"propertyName": "items",
					"values": {
						"generateId": false,
						"className": "Terrasoft.ESNHtmlEdit",
						"itemType": Terrasoft.ViewItemType.MODEL_ITEM,
						"dataValueType": Terrasoft.DataValueType.TEXT,
						"contentType": Terrasoft.ContentType.RICH_TEXT,
						"labelConfig": {
							"visible": false
						},
						"keydown": {bindTo: "onKeyDown"},
						"value": {bindTo: "SocialMessageText"},
						"placeholder": {bindTo: "Resources.Strings.WritePostHint"},
						"classes": {
							htmlEditClass: ["postMessage", "placeholderOpacity", "feedMaxWidth"]
						},
						"focus": {bindTo: "onSocialMessageEditFocus"},
						"focused": {bindTo: "SocialMessageEditFocused"},
						"blur": {bindTo: "onSocialMessageEditBlur"},
						"markerValue": "postMessageMemoEdit",
						"height": "47px",
						"prepareList": {bindTo: "prepareEntitiesExpandableList"},
						"list": {bindTo: "entitiesList"},
						"listViewItemRender": {bindTo: "onEntitiesListViewItemRender"},
						"autoGrow": true,
						"autoGrowMinHeight": 47
					}
				},
				//SocialFeedSortButton
				{
					"operation": "insert",
					"parentName": "SocialMessageContainer",
					"name": "SocialFeedSortButton",
					"propertyName": "items",
					"values": {
						"generateId": false,
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"style": Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
						"markerValue": "sortButton",
						"imageConfig": {"bindTo": "getSortButtonImageConfig"},
						"classes": {
							wrapperClass: ["social-feed-sort-button-wrapper"],
							markerClass: ["social-feed-sort-button-marker"],
							imageClass: ["social-feed-sort-button-image"]
						},
						"menu": {
							items: [{
								caption: {bindTo: "Resources.Strings.SortCreatedOn"},
								click: {bindTo: "onCreatedOnSortClick"}
							}, {
								caption: {bindTo: "Resources.Strings.SortLastActionOn"},
								click: {bindTo: "onLastActionOnSortClick"}
							}]
						}
					}
				},
				//SocialMessageActionsContainer
				{
					"operation": "insert",
					"name": "SocialMessageActionsContainer",
					"parentName": "SocialFeedHeader",
					"propertyName": "items",
					"values": {
						"generateId": false,
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"classes": {
							wrapClassName: ["postPublishActions", "feedMaxWidth", "postMessage", "relativePosition"]
						},
						"items": []
					}
				},
				//SocialChannelEditContainer
				{
					"operation": "insert",
					"name": "SocialChannelEditContainer",
					"parentName": "SocialMessageActionsContainer",
					"propertyName": "items",
					"values": {
						"generateId": false,
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"classes": {
							wrapClassName: ["comboBoxWrap"]
						},
						"visible": {bindTo: "postPublishActionsVisible"},
						"items": []
					}
				},
				//PublishButtonContainer
				{
					"operation": "insert",
					"name": "PublishButtonContainer",
					"parentName": "SocialMessageActionsContainer",
					"propertyName": "items",
					"values": {
						"generateId": false,
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"classes": {
							wrapClassName: ["publishButtonWrap"]
						},
						"visible": {bindTo: "postPublishActionsVisible"},
						"items": []
					}
				},
				//SocialChannelEdit
				{
					"operation": "insert",
					"parentName": "SocialChannelEditContainer",
					"name": "SocialChannelEdit",
					"propertyName": "items",
					"values": {
						"generateId": false,
						"itemType": Terrasoft.ViewItemType.MODEL_ITEM,
						"dataValueType": Terrasoft.DataValueType.ENUM,
						"enabled": {bindTo: "ChannelEditEnabled"},
						"controlConfig": {
							"visible": {bindTo: "ChannelEditVisible"}
						},
						"value": {bindTo: "SocialChannel"},
						"list": {bindTo: "channels"},
						"prepareList": {bindTo: "prepareChannels"},
						"placeholder": {bindTo: "getSocialChannelEditPlaceholder"},
						"focused": {bindTo: "ChannelEditFocused"},
						"blur": {bindTo: "onChannelEditBlur"},
						"classes": {
							wrapClass: ["inlineBlock", "channel", "placeholderOpacity"]
						},
						"markerValue": {bindTo: "getSocialMessageEditMarkerValue"},
						"labelConfig": {"visible": false}
					}
				},
				//PublishButton
				{
					"operation": "insert",
					"parentName": "PublishButtonContainer",
					"name": "PublishButton",
					"propertyName": "items",
					"values": {
						"generateId": false,
						"caption": {bindTo: "Resources.Strings.Publish"},
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"style": Terrasoft.controls.ButtonEnums.style.GREEN,
						"click": {bindTo: "onPostPublishClick"},
						"markerValue": "publishPostMessageButton",
						"classes": {
							textClass: ["floatRight"]
						}
					}
				},
				//ShowNewMessagesContainer
				{
					"operation": "insert",
					"name": "ShowNewMessagesContainer",
					"parentName": "SocialFeed",
					"propertyName": "items",
					"values": {
						"generateId": false,
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"visible": {bindTo: "showNewSocialMessagesVisible"},
						"classes": {
							wrapClassName: ["showNewMessagePadding", "showNewMessageContainer"]
						},
						"items": []
					}
				},
				//ShowNewMessagesButton
				{
					"operation": "insert",
					"name": "ShowNewMessagesButton",
					"parentName": "ShowNewMessagesContainer",
					"propertyName": "items",
					"values": {
						"generateId": false,
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"caption": {bindTo: "getShowNewMessageText"},
						"style": Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
						"iconAlign": this.Terrasoft.controls.ButtonEnums.iconAlign.LEFT,
						"imageConfig": {"bindTo": "getShowNewMessagesButtonImageConfig"},
						"click": {bindTo: "onShowNewMessageClick"},
						"classes": {
							textClass: ["showNewMessageButton"]
						}
					}
				},
				//SocialFeedMessagesContainer
				{
					"operation": "insert",
					"name": "SocialFeedMessagesContainer",
					"parentName": "SocialFeed",
					"propertyName": "items",
					"values": {
						"generateId": false,
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"classes": {
							wrapClassName: ["social-feed-messages"]
						},
						"items": []
					}
				},
				//SocialFeedMessages
				{
					"operation": "insert",
					"name": "SocialFeedMessages",
					"parentName": "SocialFeedMessagesContainer",
					"propertyName": "items",
					"values": {
						"generateId": false,
						"generator": "ConfigurationItemGenerator.generateContainerList",
						"idProperty": "Id",
						"collection": "SocialMessages",
						"observableRowNumber": 5,
						"observableRowVisible": {bindTo: "onLoadNext"},
						"onGetItemConfig": "getItemViewConfig",
						"classes": {
							wrapClassName: ["rightSideBarModulePostList", "feedMaxWidth", "showNewMessagePadding"]
						},
						"activeItem": {bindTo: "ActiveSocialMessageId"},
						"isAsync": {bindTo: "IsContainerListAsync"}
					}
				}
			]
		};
	});
