define("AccountPageV2", ["AccountCommunication", "ConfigurationConstants"], function(AccountCommunication,
		ConfigurationConstants) {
	return {
		messages: {
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
			 * @inheritdoc Terrasoft.BasePageV2#subscribeSandboxEvents
			 * @overridden
			 */
			subscribeSandboxEvents: function() {
				this.callParent(arguments);
				this.sandbox.subscribe("SearchResultBySocialNetworks", this.onSearchResultBySocialNetworks, this);
			},

			/*
			 * Обрабатывает результа привязки контакту средств связи из соц. сетей.
			 * @param {Object} config.selectedItems Список записей записей средств связи из соц. сетей.
			 */
			onSearchResultBySocialNetworks: function(config) {
				var collection = config.selectedItems;
				if (collection.isEmpty()) {
					return;
				}
				var socialContact = collection.getByIndex(0);
				this.setNameFromSocialNetworks(socialContact);
			},

			/*
			 * Если у контакта пустое поле "ФИО" то устанавливает его значение
			 * из полученой модели данных содержащей информацию контакта из соц. сети.
			 * @param {Object} socialContact Модель содержащая информацию контакта из соц. сети.
			 */
			setNameFromSocialNetworks: function(socialContact) {
				if (!this.Ext.isEmpty(this.get("Name")) || this.Ext.isEmpty(socialContact)) {
					return;
				}
				var name = socialContact.get("Name");
				if (name) {
					this.set("Name", name);
				}
			},

			/**
			 * @inheritdoc Terrasoft.BasePageV2#getActions
			 * @overridden
			 */
			getActions: function() {
				var actionMenuItems = this.callParent(arguments);
				actionMenuItems.addItem(this.getButtonMenuSeparator());
				actionMenuItems.addItem(this.getButtonMenuItem({
					"Tag": "openSocialAccountPage",
					"Caption": {"bindTo": "Resources.Strings.FillAccountWithSocialNetworksDataActionCaption"}
				}));
				return actionMenuItems;
			},

			/**
			 * Обработчик нажатия пункта меню "Обогатить данными из соц. сетей" кнопки "Действия".
			 */
			openSocialAccountPage: function() {
				this.save({
					callback: function() {
						this.checkCanOpenSocialPage(function() {
							this.loadSocialAccountPage();
						}, this);
					},
					callBaseSilentSavedActions: true,
					isSilent: true
				});
			},

			/**
			 * Проверяет, возможен ли переход на страницу обогащения сущности из внешнего ресурса.
			 * @protected
			 * @virtual
			 * @param {Function} callback Функция обратного вызова.
			 * @param {Object} scope Контекст вызова функции обратного вызова.
			 */
			checkCanOpenSocialPage: function(callback, scope) {
				this.checkHasSocialCommunications(function() {
					callback.call(scope);
				}, this);
			},

			/**
			 * Проверяет, существуют ли средства связи.
			 * @protected
			 * @virtual
			 * @param {Function} callback Функция обратного вызова.
			 * @param {Object} scope Контекст вызова функции обратного вызова.
			 */
			checkHasSocialCommunications: function(callback, scope) {
				var esq = this.Ext.create("Terrasoft.EntitySchemaQuery", {
					rootSchema: AccountCommunication
				});
				esq.addAggregationSchemaColumn(
						AccountCommunication.primaryColumnName, this.Terrasoft.AggregationType.COUNT, "Count");
				var contactFilter = this.Terrasoft.createColumnFilterWithParameter(
						this.Terrasoft.ComparisonType.EQUAL, "Account", this.get("Id"));
				esq.filters.addItem(contactFilter);
				var socialTypeFilter = this.Terrasoft.createColumnFilterWithParameter(
						this.Terrasoft.ComparisonType.EQUAL,
						"[ComTypebyCommunication:CommunicationType:CommunicationType].Communication",
						ConfigurationConstants.Communication.SocialNetwork);
				esq.filters.addItem(socialTypeFilter);
				esq.getEntityCollection(function(response) {
					if (!response.success) {
						throw new Terrasoft.UnknownException();
					}
					var queryResult = response.collection.getByIndex(0);
					var socialCommunicationsCount = queryResult.get("Count");
					if (socialCommunicationsCount === 0) {
						var message = this.get("Resources.Strings.FillAccountQuestion");
						return this.showInformationDialog(message);
					}
					callback.call(scope);
				}, this);
			},

			/**
			 * Загружает модуль поиска в социальных сетях.
			 * @protected
			 */
			loadSocialAccountPage: function() {
				var schemaName = "SocialAccountPage";
				var primaryColumnValue = this.get("PrimaryColumnValue") || this.get(this.primaryColumnName);
				this.sandbox.publish("PushHistoryState", {
					hash: this.Terrasoft.combinePath("CardModuleV2", schemaName, "edit", primaryColumnValue)
				});
			}
		},
		details: /**SCHEMA_DETAILS*/{}/**SCHEMA_DETAILS*/,
		diff: /**SCHEMA_DIFF*/[]/**SCHEMA_DIFF*/
	};
});
