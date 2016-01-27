define("SocialAccountModuleSchema", ["SocialAccountModuleResources", "ConfigurationConstants", "ConfigurationEnums",
		"SocialAccountAuthUtilities", "SocialAccount", "Contact", "RightUtilities", "FacebookClientUtilities"],
		function(resources, ConfigurationConstants, ConfigurationEnums, SocialAccountAuthUtilities, SocialAccount,
		Contact, RightUtilities) {
	return {
		entitySchemaName: "SocialAccount",
		mixins: {
			FacebookClientUtilities: "Terrasoft.FacebookClientUtilities"
		},
		attributes: {
			ActionsMenuItems: {
				dataValueType: Terrasoft.DataValueType.COLLECTION
			},
			GridData: {
				dataValueType: Terrasoft.DataValueType.COLLECTION
			},
			activeRowId: {
				dataValueType: Terrasoft.DataValueType.GUID,
				value: ""
			},
			GridSortColumnIndex: {
				dataValueType: Terrasoft.DataValueType.INTEGER,
				value: 0
			},
			IsGridEmpty: {
				dataValueType: Terrasoft.DataValueType.BOOLEAN,
				value: true
			}
		},
		methods: {

			/**
			 * Инициализирует колонки экземпляра запроса.
			 * @protected
			 * @param {Object} esq Запрос, в котором будут проинициализированы колонки.
			 */
			initQueryColumns: function(esq) {
				esq.addColumn("Id");
				esq.addColumn("Login");
				esq.addColumn("Public");
				esq.addColumn("Type");
				esq.addColumn("User");
				esq.addColumn("User.Contact");
				esq.addColumn("SocialId");
			},

			/**
			 * Инициализирует фильтры запроса данных.
			 * @protected
			 * @param {Object} esq Запрос данных.
			 */
			initQueryFilters: function(esq) {
				esq.filters.addItem(this.Terrasoft.createColumnFilterWithParameter(
					this.Terrasoft.ComparisonType.EQUAL, "User", this.Terrasoft.SysValue.CURRENT_USER.value));
			},

			/**
			 * Инициализирует сортировку запроса.
			 * @protected
			 * @param {Terrasoft.EntitySchemaQuery} esq Запрос.
			 */
			initQuerySorting: function(esq) {
				var typeColumn = esq.columns.get("Type");
				typeColumn.orderPosition = 0;
				typeColumn.orderDirection = Terrasoft.OrderDirection.ASC;
			},

			/**
			 * Инициализирует события запроса данных.
			 * @protected
			 * @param {Object} esq Запрос данных.
			 */
			initQueryEvents: function(esq) {
				esq.on("createviewmodel", this.createSocialAccountViewModel, this);
			},

			/**
			 * Отписывает запрос данных от событий.
			 * @protected
			 * @param {Object} esq Запрос данных.
			 */
			destroyQueryEvents: function(esq) {
				esq.un("createviewmodel", this.createSocialAccountViewModel, this);
			},

			/**
			 * Инициализирует экземляр модели представления по результатам запроса.
			 * @private
			 * @param {Object} config Конфигурация для создания модели представления.
			 * @param {Object} config.rawData Значения колонок.
			 * @param {Object} config.rowConfig Типы колонок.
			 * @param {Object} config.viewModel Модель представления.
			 */
			createSocialAccountViewModel: function(config) {
				var socialAccountViewModelClassName = this.getSocialAccountViewModelClassName();
				var socialAccountViewModelConfig = this.getSocialAccountViewModelConfig(config);
				var viewModel = this.Ext.create(socialAccountViewModelClassName, socialAccountViewModelConfig);
				viewModel.getSocialLink = function() {
					var type = this.get("Type");
					if (type.value === ConfigurationConstants.CommunicationTypes.Facebook) {
						var socialLinkTemplate = "https://www.facebook.com/{id}";
						var id = this.get("SocialId");
						var login = this.get("Login");
						return {
							title: login,
							url: socialLinkTemplate.replace("{id}", id),
							target: "_blank"
						};
					}
				};
				config.viewModel = viewModel;
			},

			/**
			 * Возвращает класс для создания модели представления.
			 * @protected
			 * @virtual
			 * @return {String} Класс для создания модели представления.
			 */
			getSocialAccountViewModelClassName: function() {
				return "Terrasoft.BaseViewModel";
			},

			/**
			 * Возвращает конфигурацию для создания модели представления.
			 * @protected
			 * @param {Object} config Конфигурация для создания модели представления.
			 * @param {Object} config.rawData Значения колонок.
			 * @param {Object} config.rowConfig Типы колонок.
			 * @return {Object} Конфигурация для создания модели представления.
			 */
			getSocialAccountViewModelConfig: function(config) {
				return {
					entitySchema: SocialAccount,
					rowConfig: config.rowConfig,
					values: config.rawData,
					isNew: false,
					isDeleted: false
				};
			},

			/**
			 * Загружает учетные записи во внешних ресурсах.
			 * @private
			 */
			loadSocialAccounts: function() {
				var select = this.Ext.create("Terrasoft.EntitySchemaQuery", {
					rootSchema: SocialAccount,
					rowViewModelClassName: this.getSocialAccountViewModelClassName()
				});
				this.initQueryColumns(select);
				this.initQueryFilters(select);
				this.initQuerySorting(select);
				this.initQueryEvents(select);
				select.getEntityCollection(function(response) {
					this.destroyQueryEvents(select);
					this.onGridDataLoaded(response);
				}, this);
			},

			/**
			 * Событие загрузки данных. Выполняется, когда сервер возвращает данные.
			 * @protected
			 * @virtual
			 * @param {Object} response Ответ от сервера.
			 * @param {Boolean} response.success Статус ответа от сервера.
			 * @param {Terrasoft.Collection} response.collection Коллекция сущностей.
			 */
			onGridDataLoaded: function(response) {
				if (response && response.success) {
					var collection = response.collection;
					this.prepareResponseCollection(collection);
					var gridData = this.get("GridData");
					gridData.clear();
					this.set("IsGridEmpty", collection.isEmpty());
					gridData.loadAll(collection);
				}
			},

			/**
			 * Аутентифицирует текущего пользователя в указанную социальную сеть.
			 * @private
			 * @param {String} socialNetwork Название социальной сети.
			 */
			authenticate: function(socialNetwork) {
				var consumerKeySetting = socialNetwork + "ConsumerKey";
				var consumerSecretSetting = socialNetwork + "ConsumerSecret";
				var arrayToQuery = [consumerKeySetting, consumerSecretSetting];
				this.Terrasoft.SysSettings.querySysSettings(arrayToQuery, function(values) {
					var consumerKey = values[consumerKeySetting];
					var consumerSecret = values[consumerSecretSetting];
					if (consumerKey !== "" && consumerSecret !== "") {
						return SocialAccountAuthUtilities.checkSysSettingsAndOpenWindow(socialNetwork, this.sandbox,
								function(data, login, socialNetworkId) {
							var communicationTypeId = socialNetworkId;
							var socialMediaId = data.socialId;
							if (communicationTypeId && !Ext.isEmpty(login) && !Ext.isEmpty(socialMediaId)) {
								this.addContactCommunication(communicationTypeId, login, socialMediaId,
									this.loadSocialAccounts, this);
							}
						});
					}
					this.Terrasoft.utils.showInformation(resources.localizableStrings.QueryAdministartor +
						socialNetwork, function() {
					}, this);
				}, this);
			},

			/**
			 * Проверяет, доступность добавления учетной записи в профиль.
			 * @private
			 * @param {String} socialNetworkType Тип социальной сети.
			 * @param {Function} callback Функция обратного вызова.
			 * @param {Object} scope Контекст выполнения функции.
			 */
			isSocialNetworkAllowed: function(socialNetworkType, callback, scope) {
				var gridData = this.get("GridData");
				var items = gridData.getItems();
				var socialNetworkName = "";
				var hasAccount = items.some(function(item) {
					var type = item.get("Type");
					var isPublic = item.get("Public");
					var check = ((type.value === socialNetworkType) && !isPublic);
					if (check) {
						socialNetworkName = type.displayValue;
						return true;
					}
				});
				if (hasAccount) {
					var message = this.Ext.String.format(
						resources.localizableStrings.OnlyOneSocialNetworkAllowedCaption, socialNetworkName);
					Terrasoft.utils.showInformation(message, null, null, {buttons: ["ok"]});
				} else if (callback) {
					callback.call(scope || this);
				}
			},

			/**
			 * Добавляет учетную запись Facebook.
			 * @private
			 */
			onFacebookMenuItemClick: function() {
				this.isSocialNetworkAllowed(ConfigurationConstants.CommunicationTypes.Facebook, function() {
					this.createFacebookSocialAccount(function() {
						this.loadSocialAccounts();
					}, this);
				}, this);
			},

			/**
			 * Добавляет учетную запись LinkedId.
			 */
			onLinkedInMenuItemClick: function() {
				this.authenticate("LinkedIn");
			},

			/**
			 * Добавляет учетную запись Twitter.
			 */
			onTwitterMenuItemClick: function() {
				this.authenticate("Twitter");
			},

			/**
			 * Добавляет учетную запись Google.
			 */
			onGoogleMenuItemClick: function() {
				this.isSocialNetworkAllowed(ConfigurationConstants.CommunicationTypes.Google, function() {
					this.authenticate("Google");
				}, this);
			},

			/**
			 * Удаляет Учетную запись во внешнем ресурсе.
			 */
			onDeleteButtonClick: function() {
				var recordId = this.get("activeRowId");
				if (!recordId) {
					return;
				}
				var config = {
					style: Terrasoft.MessageBoxStyles.BLUE
				};
				this.showConfirmationDialog(resources.localizableStrings.DeleteConfirmation, function(returnCode) {
					if (returnCode !== Terrasoft.MessageBoxButtons.YES.returnCode) {
						return;
					}
					this.showBodyMask();
					this.set("activeRowId", "");
					var gridData = this.get("GridData");
					var socialAccount = gridData.get(recordId);
					socialAccount.deleteEntity(function() {
						var number = socialAccount.get("Login");
						var communicationTypeId = socialAccount.get("Type").value;
						var socialMediaId = socialAccount.get("SocialId");
						this.deleteContactCommunication(communicationTypeId, number, socialMediaId, function() {
							this.hideBodyMask();
							gridData.removeByKey(recordId);
							this.set("IsGridEmpty", gridData.isEmpty());
						}, this);
					}, this);
				}, ["yes", "no"], config);
			},

			/**
			 * Добавляет средство связи контакта.
			 * @private
			 * @param {String} communicationTypeId Тип средства связи.
			 * @param {String} number Название пользователя во внешнем ресурсе.
			 * @param {String} socialMediaId Идентификатор пользователя во внешнем ресурсе.
			 * @param {Function} callback Функция обратного вызова.
			 * @param {Object} scope Контекст вызова функции обратного вызова.
			 */
			addContactCommunication: function(communicationTypeId, number, socialMediaId, callback, scope) {
				var insert = this.Ext.create("Terrasoft.InsertQuery", {
					rootSchemaName: "ContactCommunication"
				});
				var id = Terrasoft.utils.generateGUID();
				insert.setParameterValue("Id", id, Terrasoft.DataValueType.GUID);
				insert.setParameterValue("CommunicationType", communicationTypeId,
					Terrasoft.DataValueType.GUID);
				insert.setParameterValue("Contact", Terrasoft.SysValue.CURRENT_USER_CONTACT.value,
					Terrasoft.DataValueType.GUID);
				insert.setParameterValue("Number", number, Terrasoft.DataValueType.TEXT);
				insert.setParameterValue("SocialMediaId", socialMediaId, Terrasoft.DataValueType.TEXT);
				insert.execute(callback, scope);
			},

			/**
			 * Удаляет средство связи контакта.
			 * @private
			 * @param {String} communicationTypeId Тип средства связи.
			 * @param {String} number Название пользователя во внешнем ресурсе.
			 * @param {String} socialMediaId Идентификатор пользователя во внешнем ресурсе.
			 * @param {Function} callback Функция обратного вызова.
			 * @param {Object} scope Контекст вызова функции обратного вызова.
			 */
			deleteContactCommunication: function(communicationTypeId, number, socialMediaId, callback, scope) {
				var del = this.Ext.create("Terrasoft.DeleteQuery", {
					rootSchemaName: "ContactCommunication"
				});
				del.filters.add("ContactFilter",
					del.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
						"Contact", Terrasoft.SysValue.CURRENT_USER_CONTACT.value));
				del.filters.add("CommunicationTypeFilter",
					del.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
						"CommunicationType", communicationTypeId));
				del.filters.add("NumberFilter",
					del.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
						"Number", number));
				del.filters.add("SocialMediaIdFilter",
					del.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
						"SocialMediaId", socialMediaId));
				del.execute(callback, scope);
			},

			/**
			 * Проверяет может ли пользователь добавить учетную запись LinkedIn.
			 * @return {Boolean} Результат проверки.
			 */
			getLinkedInMenuItemVisible: function() {
				return (Contact.columns.LinkedIn.usageType !== ConfigurationEnums.EntitySchemaColumnUsageType.None);
			},

			/**
			 * @inheritdoc Terrasoft.BaseSchemaViewModel#init
			 * @overridden
			 */
			init: function() {
				this.callParent(arguments);
				this.initCollections();
				this.initActionsMenuItems();
				this.loadSocialAccounts();
			},

			initCollections: function() {
				this.set("ActionsMenuItems", this.Ext.create("Terrasoft.BaseViewModelCollection"));
				this.set("GridData", this.Ext.create("Terrasoft.BaseViewModelCollection"));
			},

			/**
			 * Инициализирует пункты меню кнопки "Действия".
			 * @private
			 */
			initActionsMenuItems: function() {
				var actionsMenuItems = this.get("ActionsMenuItems");
				actionsMenuItems.addItem(this.getButtonMenuItem({
					Caption: this.get("Resources.Strings.ConvertToPublic"),
					Click: {"bindTo": "convertToPublic"},
					Visible: {bindTo: "getConvertToPublicMenuItemVisible"}
				}));
				actionsMenuItems.addItem(this.getButtonMenuItem({
					Caption: this.get("Resources.Strings.ConvertToPrivate"),
					Click: {"bindTo": "convertToPrivate"},
					Visible: {bindTo: "getConvertToPrivateMenuItemVisible"}
				}));
				actionsMenuItems.addItem(this.getButtonMenuSeparator());
				actionsMenuItems.addItem(this.getButtonMenuItem({
					Caption: this.get("Resources.Strings.DeleteButtonCaption"),
					Click: {"bindTo": "onDeleteButtonClick"},
					Enabled: {"bindTo": "getDeleteButtonEnabled"}
				}));
			},

			/**
			 * Преобразовывает учетную запись во внешнем ресурсе в публичную.
			 */
			convertToPublic: function() {
				this.checkCanManageSharedSocialAccounts(function() {
					var config = {
						message: resources.localizableStrings.ConfirmConvertToPublic,
						isPublic: true
					};
					this.promptChangeSocialAccountType(config, function() {
						this.changeSocialAccountType(config);
					}, this);
				}, this);
			},

			/**
			 * Преобразовывает учетную запись во внешнем ресурсе в приватную.
			 */
			convertToPrivate: function() {
				this.checkCanManageSharedSocialAccounts(function() {
					var config = {
						message: resources.localizableStrings.ConfirmConvertToPrivate,
						isPublic: false
					};
					this.promptChangeSocialAccountType(config, function() {
						this.changeSocialAccountType(config);
					}, this);
				}, this);
			},

			/**
			 * Задает вопрос пользователю о необходимости изменения типа учетной записи во внешнем ресурсе.
			 * @private
			 * @param {Object} config Параметры изменения.
			 * @param {String} config.message Сообщение пользователю.
			 * @param {Function} callback Функция обратного вызова.
			 * @param {Object} scope Контекст вызова функции обратного вызова.
			 */
			promptChangeSocialAccountType: function(config, callback, scope) {
				this.showConfirmationDialog(config.message, function(result) {
					if (result !== this.Terrasoft.MessageBoxButtons.YES.returnCode) {
						return;
					}
					callback.call(scope);
				}, ["yes", "no"]);
			},

			/**
			 * Изменяет тип учетной записи во внешнем ресурсе.
			 * @private
			 * @param {Object} config Параметры изменения.
			 * @param {Boolean} config.isPublic Необходимый тип.
			 */
			changeSocialAccountType: function(config) {
				var activeRow = this.findActiveRow();
				activeRow.set("Public", config.isPublic);
				activeRow.saveEntity(function(response) {
					if (!response.success) {
						throw new Terrasoft.UnknownException({
							message: response.errorInfo.message
						});
					}
					this.set("activeRowId", "");
				}, this);
			},

			/**
			 * Проверяет тип модели представления.
			 * @private
			 * @param {Terrasoft.BaseViewModel} viewModel Модель представления.
			 * @return {Boolean} Результат проверки.
			 */
			getIsFacebook: function(viewModel) {
				var type = viewModel.get("Type");
				return (type.value === ConfigurationConstants.CommunicationTypes.Facebook);
			},

			/**
			 * Возвращает значение аттрибута "Общая" модели представления.
			 * @private
			 * @param {Terrasoft.BaseViewModel} viewModel Модель представления.
			 * @return {Boolean} Значение аттрибута "Общая" модели представления.
			 */
			getIsPublic: function(viewModel) {
				return viewModel.get("Public");
			},

			/**
			 * Возвращает значение свойства Видимость пункта меню Сделать общей.
			 * @return {Boolean} Значение свойства Видимость пункта меню Сделать общей.
			 */
			getConvertToPublicMenuItemVisible: function() {
				var activeRow = this.findActiveRow();
				if (!activeRow) {
					return false;
				}
				var isFacebook = this.getIsFacebook(activeRow);
				var isPublic = this.getIsPublic(activeRow);
				return (isFacebook && !isPublic);
			},

			/**
			 * Возвращает значение свойства Видимость пункта меню Сделать личной.
			 * @return {Boolean} Значение свойства Видимость пункта меню Сделать личной.
			 */
			getConvertToPrivateMenuItemVisible: function() {
				var activeRow = this.findActiveRow();
				if (!activeRow) {
					return false;
				}
				var isFacebook = this.getIsFacebook(activeRow);
				var isPublic = this.getIsPublic(activeRow);
				return (isFacebook && isPublic);
			},

			/**
			 * Возвращает значение свойства Активность пункта меню Удалить.
			 * @return {Boolean} Значение свойства Активность пункта меню Удалить.
			 */
			getDeleteButtonEnabled: function() {
				var activeRow = this.findActiveRow();
				return !this.Ext.isEmpty(activeRow);
			},

			/**
			 * Возвращает модель представления активной строки реестра.
			 * @private
			 * @return {Terrasoft.BaseViewModel} Модель представления активной строки реестра.
			 */
			findActiveRow: function() {
				var primaryColumnValue = this.get("activeRowId");
				var gridData = this.get("GridData");
				return gridData.find(primaryColumnValue);
			},

			/**
			 * Проверяет право текущего пользователя на администрируемую операцию "Доступ к управлению общими
			 * учетными записями во внешних ресурсах".
			 * @private
			 * @param {Function} callback Функция обратного вызова.
			 * @param scope Контекст вызова функции обратного вызова.
			 */
			checkCanManageSharedSocialAccounts: function(callback, scope) {
				this.getCanManageSharedSocialAccounts(function(operationValue) {
					if (operationValue) {
						return callback.call(scope);
					}
					var message = resources.localizableStrings.RightsErrorMessage;
					this.showInformationDialog(message);
				}, this);
			},

			/**
			 * Возвращает право текущего пользователя на администрируемую операцию "Доступ к управлению общими
			 * учетными записями во внешних ресурсах".
			 * @private
			 * @param {Function} callback Функция обратного вызова.
			 * @param scope Контекст вызова функции обратного вызова.
			 */
			getCanManageSharedSocialAccounts: function(callback, scope) {
				var operationName = "CanManageSharedSocialAccounts";
				var operationValue = this.get(operationName);
				if (!this.Ext.isEmpty(operationValue)) {
					return callback.call(scope, operationValue);
				}
				RightUtilities.checkCanExecuteOperation({operation: operationName}, function(result) {
					callback.call(scope, result);
				}, this);
			},

			/**
			 * Применяет свойства колонки по умолчанию.
			 * @private
			 * @param {Object} column Колонка.
			 */
			applyColumnDefaults: function(column) {
				if (this.Ext.isNumber(column.type)) {
					return;
				}
				var type = this.Terrasoft.ViewModelColumnType;
				column.type = this.Ext.isEmpty(column.columnPath) ? type.VIRTUAL_COLUMN : type.ENTITY_COLUMN;
			},

			/**
			 * Модифицирует коллекцию данных перед загрузкой в реестр.
			 * @private
			 * @param {Object} collection Коллекция элементов реестра.
			 */
			prepareResponseCollection: function(collection) {
				collection.each(function(item) {
					this.Terrasoft.each(item.columns, function(column) {
						this.applyColumnDefaults(column);
					}, this);
				}, this);
			},

			/**
			 * Закрывает текущую страницу.
			 */
			onCloseButtonClick: function() {
				this.sandbox.publish("BackHistoryState");
			},

			onRender: function() {
				this.callParent(arguments);
				this.initMainHeaderCaption();
			},

			initMainHeaderCaption: function() {
				var mainHeaderConfig = {
					caption: this.get("Resources.Strings.ModuleCaption"),
					dataViews: false
				};
				this.sandbox.publish("InitDataViews", mainHeaderConfig);
				this.sandbox.subscribe("NeedHeaderCaption", function() {
					this.sandbox.publish("InitDataViews", mainHeaderConfig);
				});
			}
		},
		diff: [
			{
				"operation": "insert",
				"name": "SocialAccountModuleContainer",
				"values": {
					"generateId": false,
					"itemType": Terrasoft.ViewItemType.CONTAINER,
					"classes": {
						wrapClassName: ["social-accounts-module"]
					},
					"markerValue": {bindTo: "Resources.Strings.ModuleCaption"},
					"items": []
				}
			},
			{
				"operation": "insert",
				"name": "SocialAccountModuleHeaderContainer",
				"propertyName": "items",
				"parentName": "SocialAccountModuleContainer",
				"values": {
					"generateId": false,
					"itemType": Terrasoft.ViewItemType.CONTAINER,
					"classes": {
						wrapClassName: ["container-spacing", "top-buttons"]
					},
					"items": []
				}
			},
			{
				"operation": "insert",
				"parentName": "SocialAccountModuleHeaderContainer",
				"name": "AddRecordButton",
				"propertyName": "items",
				"values": {
					"generateId": false,
					"caption": {bindTo: "Resources.Strings.AddButtonCaption"},
					"itemType": Terrasoft.ViewItemType.BUTTON,
					"style": Terrasoft.controls.ButtonEnums.style.GREEN,
					"markerValue": "AddRecordButton",
					"menu": {
						items: [
							{
								className: "Terrasoft.MenuItem",
								caption: {bindTo: "Resources.Strings.FacebookMenuItemCaption"},
								markerValue: "Facebook",
								click: {
									bindTo: "onFacebookMenuItemClick"
								}
							},
							{
								className: "Terrasoft.MenuItem",
								caption: {bindTo: "Resources.Strings.LinkedInMenuItemCaption"},
								click: {
									bindTo: "onLinkedInMenuItemClick"
								},
								visible: {
									bindTo: "getLinkedInMenuItemVisible"
								}
							},
							{
								className: "Terrasoft.MenuItem",
								caption: {bindTo: "Resources.Strings.TwitterMenuItemCaption"},
								click: {
									bindTo: "onTwitterMenuItemClick"
								}
							},
							{
								className: "Terrasoft.MenuItem",
								caption: {bindTo: "Resources.Strings.GoogleMenuItemCaption"},
								click: {
									bindTo: "onGoogleMenuItemClick"
								}
							}
						]
					}
				}
			},
			{
				"operation": "insert",
				"parentName": "SocialAccountModuleHeaderContainer",
				"name": "ActionsButton",
				"propertyName": "items",
				"values": {
					"generateId": false,
					"caption": {bindTo: "Resources.Strings.ActionsButtonCaption"},
					"itemType": Terrasoft.ViewItemType.BUTTON,
					"markerValue": "ActionsButton",
					"menu": {
						items: {
							bindTo: "ActionsMenuItems"
						}
					}
				}
			},
			{
				"operation": "insert",
				"parentName": "SocialAccountModuleHeaderContainer",
				"name": "CloseButton",
				"propertyName": "items",
				"values": {
					"generateId": false,
					"caption": {bindTo: "Resources.Strings.CloseButtonCaption"},
					"itemType": Terrasoft.ViewItemType.BUTTON,
					"markerValue": "CloseButton",
					click: {
						bindTo: "onCloseButtonClick"
					}
				}
			},
			{
				"operation": "insert",
				"name": "SocialAccountModuleMainContainer",
				"propertyName": "items",
				"parentName": "SocialAccountModuleContainer",
				"values": {
					"generateId": false,
					"itemType": Terrasoft.ViewItemType.CONTAINER,
					"classes": {
						wrapClassName: ["container-spacing"]
					},
					"items": []
				}
			},
			{
				"operation": "insert",
				"name": "DataGrid",
				"propertyName": "items",
				"parentName": "SocialAccountModuleMainContainer",
				"values": {
					"itemType": Terrasoft.ViewItemType.GRID,
					"type": "listed",
					"listedZebra": true,
					"activeRow": {"bindTo": "activeRowId"},
					"collection": {"bindTo": "GridData"},
					"isEmpty": {"bindTo": "IsGridEmpty"},
					"primaryColumnName": "Id",
					"sortColumnIndex": {"bindTo": "GridSortColumnIndex"},
					"rowDataItemMarkerColumnName": "Type",
					"captionsConfig": [
						{
							cols: 4,
							name: resources.localizableStrings.TypeColName
						},
						{
							cols: 12,
							name: resources.localizableStrings.LoginColCaption
						},
						{
							cols: 6,
							name: resources.localizableStrings.UserColName
						},
						{
							cols: 2,
							name: resources.localizableStrings.PublicColName
						}
					],
					"columnsConfig": [
						{
							cols: 4,
							key: [
								{
									name: {
										bindTo: "Type"
									}
								}
							]
						},
						{
							cols: 12,
							key: [
								{
									name: {
										bindTo: "Login"
									}
								}
							],
							link: {
								"bindTo": "getSocialLink"
							}
						},
						{
							cols: 6,
							key: [
								{
									name: {
										bindTo: "User"
									}
								}
							]
						},
						{
							cols: 2,
							key: [
								{
									name: {
										bindTo: "Public"
									}
								}
							]
						}
					]
				}
			}
		]
	};
});
