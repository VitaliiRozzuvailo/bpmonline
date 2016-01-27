define("ContactPageV2", ["BaseFiltersGenerateModule", "BusinessRuleModule", "ContactPageV2Resources",
			"ConfigurationConstants", "ContactCareer", "DuplicatesSearchUtilitiesV2"],
		function(BaseFiltersGenerateModule, BusinessRuleModule, resources, ConfigurationConstants, ContactCareer) {
			return {
				entitySchemaName: "Contact",
				messages: {
					/**
					 * @message GetDuplicateSearchConfig
					 * Отправляет параметры для модуля поиска дублей.
					 * @return {Object} Параметры для модуля поиска дублей.
					 */
					"GetDuplicateSearchConfig": {
						mode: Terrasoft.MessageMode.PTP,
						direction: Terrasoft.MessageDirectionType.SUBSCRIBE
					},

					/**
					 * @message FindDuplicatesResult
					 * Обрабатывает результаты поиска дублей.
					 * @param {Object} Результат работы модуля поиска дублей.
					 */
					"FindDuplicatesResult": {
						mode: Terrasoft.MessageMode.BROADCAST,
						direction: Terrasoft.MessageDirectionType.SUBSCRIBE
					},

					/**
					 * @message SetInitialisationData
					 * Устанавливает изначальные параметры поиска в социальных сетях.
					 */
					"SetInitialisationData": {
						mode: Terrasoft.MessageMode.PTP,
						direction: Terrasoft.MessageDirectionType.SUBSCRIBE
					},

					/**
					 * @message ResultSelectedRows
					 * Возвращает выбранные строки в справочнике.
					 */
					"ResultSelectedRows": {
						mode: Terrasoft.MessageMode.PTP,
						direction: Terrasoft.MessageDirectionType.SUBSCRIBE
					},

					/**
					 * @message GetCommunicationsList
					 * Запрашивает список средств связи.
					 */
					"GetCommunicationsList": {
						mode: Terrasoft.MessageMode.PTP,
						direction: Terrasoft.MessageDirectionType.PUBLISH
					}
				},
				attributes: {	// Колонки схемы, здесь указываются только добавленные или измененные относительно родителя
					// Все колонки из схемы объекта включаются сюда автоматически на этапе генерации
					"PrimaryContactAdd": {
						dataValueType: Terrasoft.DataValueType.BOOLEAN,
						type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
					},
					"SomeCalcField": {
						name: "CalcField",
						dataValueType: Terrasoft.DataValueType.TEXT,
						type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
					},
					"Owner": {
						dataValueType: Terrasoft.DataValueType.LOOKUP,
						lookupListConfig: {filter: BaseFiltersGenerateModule.OwnerFilter}
					},
					"AccountIsEmpty": {
						dataValueType: Terrasoft.DataValueType.BOOLEAN,
						type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
					},
					"JobTitle": {
						dependencies: [
							{
								columns: ["Job"],
								methodName: "jobChanged"
							}
						]
					},
					"canUseSocialFeaturesByBuildType": {
						dataValueType: this.Terrasoft.DataValueType.BOOLEAN,
						value: false
					}
				},
				rules: {		// Описание бизнес-правил для колонок (только добавленные или измененные относительно родителя)
					"City": {	// Бизнес-правила для колонки City
						"FilteringCityByCounty": {		// Формат бизнес-правил: http://tswiki/pages/viewpage.action?pageId=26251542
							ruleType: BusinessRuleModule.enums.RuleType.FILTRATION,
							autocomplete: true,
							baseAttributePatch: "Country",
							comparisonType: Terrasoft.ComparisonType.EQUAL,
							type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
							attribute: "Country",
							attributePath: "",
							value: ""
						}
					}
				},
				// Описание всех деталей, привязки, фильтров (только добавленные или измененные относительно родителя)
				details: /**SCHEMA_DETAILS*/{
					ContactCommunication: {
						/*// name: "ContactCommunication", - можно явно указать name, по умолчанию берется имя объекта настройки детали
						 filter: {masterColumn: "Id", detailColumn: "ContactId"}, // masterColumn необязателен, по умолчанию - "Id"
						 filterMethod: function() {
						 }, // Метод для создания фильтра - при сложной фильтрации
						 defaultValues: {"Number": "50",
						 "Name": "Default11"} // Значения по умолчанию*/
						schemaName: "ContactCommunicationDetail",
						filter: {
							masterColumn: "Id",
							detailColumn: "Contact"
						}
					},
					Activities: {
						schemaName: "ActivityDetailV2",
						filter: {
							masterColumn: "Id",
							detailColumn: "Contact"
						},
						filterMethod: "activitiesDetailFilter"
					},
					Relationships: {
						schemaName: "ContactRelationshipDetailV2",
						filterMethod: "relationshipsDetailFilter",
						defaultValues: {
							ContactA: {
								masterColumn: "Id"
							}
						}
					},
					ContactCareer: {
						schemaName: "ContactCareerDetailV2",
						filter: {
							masterColumn: "Id",
							detailColumn: "Contact"
						},
						defaultValues: {
							Contact: {
								masterColumn: "Id"
							}
						}
					},
					Files: {
						schemaName: "FileDetailV2",
						entitySchemaName: "ContactFile",
						filter: {
							masterColumn: "Id",
							detailColumn: "Contact"
						}
					},
					ContactAddress: {
						schemaName: "ContactAddressDetailV2",
						filter: {
							masterColumn: "Id",
							detailColumn: "Contact"
						}
					},
					ContactAnniversary: {
						schemaName: "ContactAnniversaryDetailV2",
						filter: {
							masterColumn: "Id",
							detailColumn: "Contact"
						},
						subscriber: {
							"methodName": "sendSaveCardModuleResponse"
						}
					},
					EmailDetailV2: {
						schemaName: "EmailDetailV2",
						filter: {
							masterColumn: "Id",
							detailColumn: "Contact"
						},
						filterMethod: "emailDetailFilter"
					}
				}/**SCHEMA_DETAILS*/,
				mixins: {
					DuplicatesSearchUtilitiesV2: "Terrasoft.DuplicatesSearchUtilitiesV2"
				},
				methods: {

					/**
					 * @obsolete
					 */
					fillContactWithSocialNetworksData: function() {
						var confirmationMessage = this.get("Resources.Strings.OpenContactCardQuestion");
						var activeRowId = this.get("Id");
						var facebookId = this.get("FacebookId");
						var linkedInId = this.get("LinkedInId");
						var twitterId = this.get("TwitterId");
						if (facebookId !== "" || linkedInId !== "" || twitterId !== "") {
							this.sandbox.publish("PushHistoryState", {
								hash: "FillContactWithSocialAccountDataModule",
								stateObj: {
									FacebookId: facebookId,
									LinkedInId: linkedInId,
									TwitterId: twitterId,
									ContactId: activeRowId
								}
							});
						} else {
							this.Terrasoft.utils.showConfirmation(confirmationMessage, Ext.emptyFn, ["ok"], this);
						}
					},

					/**
					 * @inheritdoc Terrasoft.BasePageV2#init
					 * @overridden
					 */
					init: function() {
						this.callParent(arguments);
						this.mixins.DuplicatesSearchUtilitiesV2.init.call(this);
						this.Terrasoft.SysSettings.querySysSettingsItem("BuildType", function(buildType) {
							this.set("canUseSocialFeaturesByBuildType",
									(buildType !== ConfigurationConstants.BuildType.Public));
						}, this);
					},

					/**
					 * Функция создания фильтров детали activities
					 */
					activitiesDetailFilter: function() {
						return this.Terrasoft.createColumnFilterWithParameter(this.Terrasoft.ComparisonType.EQUAL,
								"[ActivityParticipant:Activity].Participant.Id", this.get("Id"));
					},

					/**
					 * Функция создания фильтров детали Email
					 */
					emailDetailFilter: function() {
						var filterGroup = new this.Terrasoft.createFilterGroup();
						filterGroup.logicalOperation = Terrasoft.LogicalOperatorType.AND;
						filterGroup.add("ContactFilter", this.Terrasoft.createColumnFilterWithParameter(this.Terrasoft.ComparisonType.EQUAL,
								"[ActivityParticipant:Activity].Participant.Id", this.get("Id")));
						filterGroup.add("EmailFilter", this.Terrasoft.createColumnFilterWithParameter(this.Terrasoft.ComparisonType.EQUAL,
								"Type", ConfigurationConstants.Activity.Type.Email));
						return filterGroup;
					},

					/**
					 * Функция создания фильтров детали relationships
					 */
					relationshipsDetailFilter: function() {
						var filterGroup = new this.Terrasoft.createFilterGroup();
						filterGroup.logicalOperation = this.Terrasoft.LogicalOperatorType.OR;
						filterGroup.add("ContactFilter", this.Terrasoft.createColumnFilterWithParameter(
								this.Terrasoft.ComparisonType.EQUAL, "Contact", this.get("Id")));
						/*filterGroup.add("ContactBFilter", this.Terrasoft.createColumnFilterWithParameter(
						 this.Terrasoft.ComparisonType.EQUAL, "ContactB", this.get("Id")));*/
						return filterGroup;
					},

					/**
					 * Функция создания фильтров детали history
					 */
					historyDetailFilter: function() {
						var filterGroup = new this.Terrasoft.createFilterGroup();
						filterGroup.add("ContactFilter", this.Terrasoft.createColumnFilterWithParameter(
								this.Terrasoft.ComparisonType.EQUAL, "Contact", this.get("Id")));
						filterGroup.add("sysWorkspacedetailFilter", this.Terrasoft.createColumnFilterWithParameter(
								this.Terrasoft.ComparisonType.EQUAL,
								"SysEntity.SysWorkspace", this.Terrasoft.SysValue.CURRENT_WORKSPACE.value));
						return filterGroup;
					},

					/**
					 * Генерирует имя серверного метода для поиска дублей
					 * @protected
					 * @overridden
					 * @return {string} Возвращает имя серверного метода для поиска дублей
					 */
					getFindDuplicatesMethodName: function() {
						return "FindContactDuplicates";
					},

					/**
					 * Генерирует имя серверного метода сохранения результаты работы с дублями
					 * @protected
					 * @overriden
					 * @return {string} Возвращает имя серверного метода сохранения результаты работы с дублями
					 */
					getSetDuplicatesMethodName: function() {
						return "SetContactDuplicates";
					},

					/**
					 * @inheritdoc Terrasoft.BasePageV2#onEntityInitialized
					 * @overridden
					 */
					onEntityInitialized: function() {
						this.setAccountIsEmpty();
						var duplicateStorage = this.Terrasoft.configuration.Storage.DuplicateStorage || {};
						if (duplicateStorage.ContactPerformSearchOnSave) {
							this.set("PerformSearchOnSave", duplicateStorage.ContactPerformSearchOnSave);
						} else {
							this.set("PerformSearchOnSave", false);
							var config = {
								serviceName: "SearchDuplicatesService",
								methodName: "GetContactPerformSearchOnSave"
							};
							var callback = function(response) {
								duplicateStorage.ContactPerformSearchOnSave = response.GetContactPerformSearchOnSaveResult;
								this.Terrasoft.configuration.Storage.DuplicateStorage = duplicateStorage;
								this.set("PerformSearchOnSave", duplicateStorage.ContactPerformSearchOnSave);
							};
							this.callService(config, callback, this);
						}
						this.callParent();
					},

					/**
					 * @obsolete
					 */
					getSrcMethod: function() {
						return this.getContactImage();
					},

					/**
					 * Возвращает web-адрес фотографии контакта.
					 * @private
					 * @return {String} Web-адрес фотографии контакта.
					 */
					getContactImage: function() {
						var primaryImageColumnValue = this.get(this.primaryImageColumnName);
						if (primaryImageColumnValue) {
							return this.getSchemaImageUrl(primaryImageColumnValue);
						}
						return this.getContactDefaultImage();
					},

					/**
					 * Возвращает web-адрес фотографии контакта по умолчанию.
					 * @private
					 * @return {String} Web-адрес фотографии контакта по умолчанию.
					 */
					getContactDefaultImage: function() {
						return this.Terrasoft.ImageUrlBuilder.getUrl(this.get("Resources.Images.DefaultPhoto"));
					},

					/**
					 * Обрабатывает изменение фотографии контакта.
					 * @private
					 * @param {File} photo Фотография.
					 */
					onPhotoChange: function(photo) {
						if (!photo) {
							this.set(this.primaryImageColumnName, null);
							return;
						}
						this.Terrasoft.ImageApi.upload({
							file: photo,
							onComplete: this.onPhotoUploaded,
							onError: this.Terrasoft.emptyFn,
							scope: this
						});
					},

					onPhotoUploaded: function(imageId) {
						var imageData = {
							value: imageId,
							displayValue: "Photo"
						};
						this.set(this.primaryImageColumnName, imageData);
					},

					/**
					 * Валидирует значения модели представления.
					 * Если присутствуют некорректные значения, выводит сообщение о необходимости заполнения первого.
					 * Иначе вызывается callback-функция. В данном случае проверяет включен ли режим поиск дублей.
					 * Если так, то выполнить поиск дублей
					 * @protected
					 * @overridden
					 * @param {Function} callback callback-функция
					 * @param {Terrasoft.BaseSchemaViewModel} scope Контекст выполнения callback-функции
					 */
					asyncValidate: function(callback, scope) {
						this.callParent([function(result) {
							if (!result.success || !this.get("PerformSearchOnSave")) {
								callback.call(scope, result);
							} else {
								this.findOnSave(callback, scope);
							}
						}, this]);
					},

					/**
					 * @inheritdoc Terrasoft.BasePageV2#save
					 * @overridden
					 */
					save: function() {
						this.setIsCareerPropertyChanged();
						this.callParent(arguments);
					},

					/**
					 * @inheritdoc Terrasoft.BasePageV2#onSaved
					 * @overridden
					 */
					onSaved: function() {
						if (this.get("CallParentOnSaved")) {
							this.set("CallParentOnSaved", false);
							this.callParent(arguments);
						} else {
							this.set("ParentOnSavedArguments", arguments);
							this.Terrasoft.chain(
									this.setDuplicates,
									this.updateAccountPrimaryContact,
									this.changeCareer,
									this.callParentOnSaved,
									this
							);
						}
					},

					/**
					 * Вызывет родительский метод onSaved
					 * @protected
					 */
					callParentOnSaved: function() {
						this.set("CallParentOnSaved", true);
						this.onSaved.apply(this, this.get("ParentOnSavedArguments"));
					},

					/**
					 * Обновляет детали после изменений на детали карьеры контакта
					 */
					updateCareerDetails: function() {
						this.setAccountIsEmpty();
						this.setIsCareerPropertyChanged();
						this.updateDetails(arguments);
					},

					/**
					 * Сохраняет изменения информации о карьере контакта.
					 * Добавляет или изменяет записи на детали Карьера контакта.
					 * 1. Если в поле «Контрагент» в карточке очищено - найти в детали запись по этому контрагенту
					 * с признаками «Текущее» и «Основное» и в этой записи установить дату завершения = текущая дата
					 * и снять признак «Текущее». Вопрос задавать не нужно.
					 * 2. Если поле «Контрагент» было изменено, а перед этим было пустым, то добавлять новую запись
					 * в детали «Карьера» ничего при этом не спрашивая.
					 * 3. Иначе, при любых других изменениях в полях
					 * (Контрагент, Должность, Полное название должности, Департамент), участвующих в синхронизации
					 * с деталью на уровне объекта проверять: если для нового набора полей не существует записи в карьере
					 * с признаками "Основное" и "Текущее", то необходимо добавлять такую запись с этими признаками.
					 * Если ранее существовала другая запись с признаком Текущее – снимать у нее признак "Текущее" и
					 * заполнять дату завершения текущей датой.
					 * @protected
					 * @param {Function} callback Функция обратного вызова.
					 */
					changeCareer: function(callback) {
						var account = this.get("Account");
						var accountWasEmpty = this.get("AccountIsEmpty");
						if (!account && !accountWasEmpty) {
							this.updateCurrentCareerInfo(callback);
							return;
						}
						var addMode = this.isAddMode();
						var copyMode = this.isCopyMode();
						if (account && (accountWasEmpty || addMode || copyMode)) {
							this.addNewCareerInfo(callback);
							return;
						}
						var careerPropertyChanged = this.get("IsCareerPropertyChanged");
						var primaryContactAdd = this.get("PrimaryContactAdd");
						if (careerPropertyChanged && !primaryContactAdd && !copyMode) {
							this.promtAddNewCareerInfo(callback);
							return;
						}
						if (callback) {
							callback.call(this);
						}
					},

					/**
					 * Обрабатывает событие сохранения изменений информации о карьере контакта.
					 * Обновляет деталь Карьера контакта.
					 * @private
					 * @param {Function} callback Функция обратного вызова.
					 */
					onCareerInfoChanged: function(callback) {
						this.updateCareerDetails();
						callback.call(this);
					},

					/**
					 * Задает вопрос пользователю о необходимости добавления записи на деталь Карьера контакта.
					 * @private
					 * @param {Function} callback Функция обратного вызова.
					 */
					promtAddNewCareerInfo: function(callback) {
						var message = this.get("Resources.Strings.ContactCareerInfoChanged");
						var buttons = this.Terrasoft.MessageBoxButtons;
						this.showConfirmationDialog(message, function(returnCode) {
							this.promtAddNewCareerInfoHandler(returnCode, callback);
						}, [buttons.YES.returnCode, buttons.NO.returnCode]);
					},

					/**
					 * Обрабатывает ответ пользователя на вопрос о необходимости добавления записи
					 * на деталь Карьера контакта.
					 * @private
					 * @param {String} returnCode Код выбранного варианта ответа.
					 * @param {Function} callback Функция обратного вызова.
					 */
					promtAddNewCareerInfoHandler: function(returnCode, callback) {
						if (returnCode === this.Terrasoft.MessageBoxButtons.YES.returnCode) {
							this.addNewCareerInfo(callback);
							return;
						}
						callback();
					},

					/**
					 * Добавляет запись на деталь Карьера контакта.
					 * Обновляет существующие записи на детали с признаком "Текущее".
					 * @param {Function} callback Функция обратного вызова.
					 */
					addNewCareerInfo: function(callback) {
						var addMode = this.isAddMode();
						var copyMode = this.isCopyMode();
						var batchQuery = this.Ext.create("Terrasoft.BatchQuery");
						if (!addMode || !copyMode) {
							var updateCurrentCareerInfo = this.getUpdateCurrentCareerInfo();
							batchQuery.add(updateCurrentCareerInfo);
						}
						var insertContactCareerQuery = this.getInsertContactCareerQuery();
						batchQuery.add(insertContactCareerQuery);
						batchQuery.execute(function() {
							this.onCareerInfoChanged(callback);
						}, this);
					},

					/**
					 * Обновляет существующие записи на детали Карьера контакта с признаком "Текущее".
					 * @param {Function} callback Функция обратного вызова.
					 */
					updateCurrentCareerInfo: function(callback) {
						var updateCurrentCareerInfo = this.getUpdateCurrentCareerInfo();
						updateCurrentCareerInfo.execute(function() {
							this.onCareerInfoChanged(callback);
						}, this);
					},

					/**
					 * Возращает запрос вставки записи карьеры контакта.
					 * @return {Terrasoft.InsertQuery} Запрос вставки записи карьеры контакта.
					 */
					getInsertContactCareerQuery: function() {
						var insert = this.Ext.create("Terrasoft.InsertQuery", {
							rootSchema: ContactCareer
						});
						var account = this.get("Account");
						if (!this.Ext.isEmpty(account)) {
							insert.setParameterValue("Account", account.value);
						}
						var job = this.get("Job");
						if (!this.Ext.isEmpty(job)) {
							insert.setParameterValue("Job", job.value);
						}
						var jobTitle = this.get("JobTitle");
						if (!this.Ext.isEmpty(jobTitle)) {
							insert.setParameterValue("JobTitle", jobTitle);
						}
						var department = this.get("Department");
						if (!this.Ext.isEmpty(department)) {
							insert.setParameterValue("Department", department.value);
						}
						insert.setParameterValue("Contact", this.get("Id"));
						insert.setParameterValue("Current", true);
						insert.setParameterValue("Primary", true);
						return insert;
					},

					/**
					 * @obsolete
					 */
					getUpdateContactCareerQuery: function(notUpdate) {
						var update = this.Ext.create("Terrasoft.UpdateQuery", {
							rootSchemaName: "ContactCareer"
						});
						var filters = update.filters;
						var idContact = this.get("Id");
						var idFilter = this.Terrasoft.createColumnFilterWithParameter(this.Terrasoft.ComparisonType.EQUAL,
								"Contact", idContact);
						filters.add("IdFilter", idFilter);
						if (notUpdate) {
							update.setParameterValue("Current", false, this.Terrasoft.DataValueType.BOOLEAN);
							update.setParameterValue("DueDate", new Date(), this.Terrasoft.DataValueType.DATE);
						} else {
							var currentFilter = this.Terrasoft.createColumnFilterWithParameter(this.Terrasoft.ComparisonType.EQUAL,
									"Current", true);
							filters.add("currentFilter", currentFilter);
							var primaryFilter = this.Terrasoft.createColumnFilterWithParameter(this.Terrasoft.ComparisonType.EQUAL,
									"Primary", true);
							filters.add("primaryFilter", primaryFilter);
							var account = this.get("Account");
							var job = this.get("Job");
							var jobTitle = this.get("JobTitle");
							var department = this.get("Department");
							if (!this.Ext.isEmpty(account)) {
								update.setParameterValue("Account", account.value, this.Terrasoft.DataValueType.GUID);
							}
							if (!this.Ext.isEmpty(job)) {
								update.setParameterValue("Job", job.value, this.Terrasoft.DataValueType.GUID);
							}
							if (!this.Ext.isEmpty(jobTitle)) {
								update.setParameterValue("JobTitle", jobTitle, this.Terrasoft.DataValueType.TEXT);
							}
							if (!this.Ext.isEmpty(department)) {
								update.setParameterValue("Department", department.value, this.Terrasoft.DataValueType.GUID);
							}
						}
						return update;
					},

					/**
					 * Возвращает запрос на обновление существующих записей на детали Карьера контакта
					 * с признаком "Текущее".
					 * @return {Terrasoft.UpdateQuery} Запрос на обновление существующих записей на детали Карьера контакта
					 * с признаком "Текущее".
					 */
					getUpdateCurrentCareerInfo: function() {
						var query = this.Ext.create("Terrasoft.UpdateQuery", {
							rootSchema: ContactCareer
						});
						query.filters.addItem(this.Terrasoft.createColumnFilterWithParameter(
								this.Terrasoft.ComparisonType.EQUAL, "Contact", this.get("Id")));
						query.filters.addItem(this.Terrasoft.createColumnFilterWithParameter(
								this.Terrasoft.ComparisonType.EQUAL, "Current", true));
						query.setParameterValue("Current", false);
						query.setParameterValue("DueDate", new Date());
						return query;
					},

					/**
					 * Обновляет основной контакт контрагента.
					 * @private
					 * @param {Function} callback Функция обратного вызова.
					 */
					updateAccountPrimaryContact: function(callback) {
						var account = this.get("Account");
						if (!this.isAddMode() || this.Ext.isEmpty(account) || !this.get("PrimaryContactAdd")) {
							if (callback) {
								callback.call(this);
							}
						} else {
							var update = this.Ext.create("Terrasoft.UpdateQuery", {rootSchemaName: "Account"});
							update.enablePrimaryColumnFilter(account.value);
							update.setParameterValue("PrimaryContact", this.get("Id"), this.Terrasoft.DataValueType.LOOKUP);
							var batch = this.Ext.create("Terrasoft.BatchQuery");
							batch.add(update, function() {}, this);
							batch.execute(function() {
								this.updateDetails();
								if (callback) {
									callback.call(this);
								}
							}, this);
						}
					},

					/**
					 * @obsolete
					 */
					getSelectedButton: function(returnCode, callback) {
						if (returnCode === this.Terrasoft.MessageBoxButtons.YES.returnCode) {
							var account = this.get("Account");
							var batch = this.Ext.create("Terrasoft.BatchQuery");
							batch.add(this.getUpdateContactCareerQuery(true), function() {}, this);
							if (!this.Ext.isEmpty(account)) {
								batch.add(this.getInsertContactCareerQuery(), function() {}, this);
							}
							batch.execute(function() {
								this.updateCareerDetails();
								if (callback) {
									callback.call(this);
								}
							}, this);
						} else {
							this.getUpdateContactCareerQuery().execute(function() {
								this.updateCareerDetails();
								if (callback) {
									callback.call(this);
								}
							}, this);
						}
					},

					/**
					 * Проверяет есть ли изменения в полях Контрагент, Должность, Полное название должности, Департамент.
					 * @protected
					 * @return {Boolean} Результат проверки.
					 */
					isCareerPropertyChanged: function() {
						var values = this.changedValues;
						return values && (values.Account || values.Job || values.JobTitle || values.Department);
					},

					/**
					 * Устанавливает флаг изменений в полях карьеры контакта
					 */
					setIsCareerPropertyChanged: function() {
						this.set("IsCareerPropertyChanged", this.isCareerPropertyChanged());
					},

					/**
					 * Обновляет поле Полное название должности по изменнеию поля Должность
					 */
					jobChanged: function() {
						var job = this.get("Job");
						if (!this.Ext.isEmpty(job)) {
							this.set("JobTitle", job.displayValue);
						}
					},

					/**
					 * Устанавливает значение признака "AccountIsEmpty".
					 * Используется при проверке изменения поля контрагент.
					 * @private
					 */
					setAccountIsEmpty: function() {
						this.set("AccountIsEmpty", this.Ext.isEmpty(this.get("Account")));
					},

					/**
					 * Возвращает массив средств связи контакта.
					 * @overridden
					 * @return {Array} Массив средств связи.
					 */
					getCommunications: function() {
						var contactCommunicationDetailId = this.getDetailId("ContactCommunication");
						var communications = this.sandbox.publish("GetCommunicationsList", null,
								[contactCommunicationDetailId]);
						var result = [];
						this.Terrasoft.each(communications, function(item) {
							result.push({
								"Id": item.Id,
								"Number": item.Number
							});
						}, this);
						return result;
					}
				},
				diff: /**SCHEMA_DIFF*/[
					{
						"operation": "merge",
						"name": "HeaderContainer",
						"values": {
							"wrapClass": ["header-container-margin-bottom", "width-auto"]
						}
					},
					{
						"operation": "insert",
						"parentName": "Header",
						"propertyName": "items",
						"name": "PhotoContainer",
						"values": {
							"itemType": Terrasoft.ViewItemType.CONTAINER,
							"wrapClass": ["image-edit-container"],
							"layout": {"column": 0, "row": 0, "rowSpan": 4, "colSpan": 2},
							"items": []
						}
					},
					{
						"operation": "insert",
						"parentName": "PhotoContainer",
						"propertyName": "items",
						"name": "Photo",
						"values": {
							"getSrcMethod": "getContactImage",
							"onPhotoChange": "onPhotoChange",
							"readonly": false,
							"defaultImage": Terrasoft.ImageUrlBuilder.getUrl(resources.localizableImages.DefaultPhoto),
							"generator": "ImageCustomGeneratorV2.generateCustomImageControl"
						}
					},
					{
						"operation": "insert",
						"parentName": "Header",
						"propertyName": "items",
						"name": "Name",
						"values": {
							"layout": {"column": 2, "row": 0, "colSpan": 22}
						}
					},
					{
						"operation": "insert",
						"parentName": "Header",
						"propertyName": "items",
						"name": "Account",
						"values": {
							"layout": {"column": 2, "row": 1, "colSpan": 22}
						}
					},
					{
						"operation": "insert",
						"parentName": "Header",
						"propertyName": "items",
						"name": "Type",
						"values": {
							"contentType": Terrasoft.ContentType.ENUM,
							"layout": {"column": 2, "row": 2, "colSpan": 9}
						}
					},
					{
						"operation": "insert",
						"parentName": "Header",
						"propertyName": "items",
						"name": "Owner",
						"values": {
							"layout": {"column": 11, "row": 2, "colSpan": 13}
						}
					},
					// tab 1
					{
						"operation": "insert",
						"name": "GeneralInfoTab",
						"parentName": "Tabs",
						"propertyName": "tabs",
						"values": {
							"caption": {"bindTo": "Resources.Strings.GeneralInfoTabCaption"},
							"items": []
						}
					},
					{
						"operation": "insert",
						"parentName": "GeneralInfoTab",
						"name": "ContactGeneralInfoControlGroup",
						"propertyName": "items",
						"values": {
							"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
							"items": []
						}
					},
					{
						"operation": "insert",
						"parentName": "ContactGeneralInfoControlGroup",
						"propertyName": "items",
						"name": "ContactGeneralInfoBlock",
						"values": {
							"itemType": Terrasoft.ViewItemType.GRID_LAYOUT,
							"items": []
						}
					},
					{
						"operation": "insert",
						"name": "JobTabContainer",
						"parentName": "Tabs",
						"propertyName": "tabs",
						"values": {
							"caption": {"bindTo": "Resources.Strings.JobTabCaption"},
							"items": []
						}
					},
					{
						"operation": "insert",
						"parentName": "JobTabContainer",
						"name": "JobInformationControlGroup",
						"propertyName": "items",
						"values": {
							"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
							"items": []
						}
					},
					{
						"operation": "insert",
						"parentName": "JobInformationControlGroup",
						"propertyName": "items",
						"name": "JobInformationBlock",
						"values": {
							"itemType": Terrasoft.ViewItemType.GRID_LAYOUT,
							"items": []
						}
					},
					{
						"operation": "insert",
						"name": "HistoryTab",
						"parentName": "Tabs",
						"propertyName": "tabs",
						"values": {
							"caption": {"bindTo": "Resources.Strings.HistoryTabCaption"},
							"items": []
						}
					},
					{
						"operation": "insert",
						"name": "NotesAndFilesTab",
						"parentName": "Tabs",
						"propertyName": "tabs",
						"values": {
							"caption": {"bindTo": "Resources.Strings.NotesAndFilesTabCaption"},
							"items": []
						}
					},
					{
						"operation": "insert",
						"parentName": "NotesAndFilesTab",
						"name": "NotesAndFilesTabContainer",
						"propertyName": "items",
						"values": {
							"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
							"items": []
						}
					},
					{
						"operation": "insert",
						"parentName": "NotesAndFilesTabContainer",
						"propertyName": "items",
						"name": "NotesAndFilesInformationBlock",
						"values": {
							"itemType": Terrasoft.ViewItemType.GRID_LAYOUT,
							"items": []
						}
					},
					{
						"operation": "insert",
						"parentName": "ContactGeneralInfoBlock",
						"propertyName": "items",
						"name": "SalutationType",
						"values": {
							"contentType": Terrasoft.ContentType.ENUM,
							"layout": {"column": 0, "row": 0}
						}
					},
					{
						"operation": "insert",
						"parentName": "ContactGeneralInfoBlock",
						"propertyName": "items",
						"name": "Gender",
						"values": {
							"contentType": Terrasoft.ContentType.ENUM,
							"layout": {"column": 12, "row": 0}
						}
					},
					{
						"operation": "insert",
						"parentName": "JobInformationBlock",
						"propertyName": "items",
						"name": "Job",
						"values": {
							"contentType": Terrasoft.ContentType.ENUM,
							"layout": {"column": 0, "row": 0}
						}
					},
					{
						"operation": "insert",
						"parentName": "JobInformationBlock",
						"propertyName": "items",
						"name": "JobTitle",
						"values": {
							"layout": {"column": 12, "row": 0}
						}
					},
					{
						"operation": "insert",
						"parentName": "JobInformationBlock",
						"propertyName": "items",
						"name": "Department",
						"values": {
							"contentType": Terrasoft.ContentType.ENUM,
							"layout": {"column": 0, "row": 1}
						}
					},
					{
						"operation": "insert",
						"parentName": "JobInformationBlock",
						"propertyName": "items",
						"name": "DecisionRole",
						"values": {
							"contentType": Terrasoft.ContentType.ENUM,
							"layout": {"column": 12, "row": 1}
						}
					},
					{
						"operation": "insert",
						"parentName": "HistoryTab",
						"propertyName": "items",
						"name": "Activities",
						"values": {
							"itemType": Terrasoft.ViewItemType.DETAIL
						}
					},
					{
						"operation": "insert",
						"parentName": "HistoryTab",
						"propertyName": "items",
						"name": "EmailDetailV2",
						"values": {
							"itemType": Terrasoft.ViewItemType.DETAIL
						}
					},
					{
						"operation": "insert",
						"parentName": "GeneralInfoTab",
						"propertyName": "items",
						"name": "ContactCommunication",
						"values": {
							"itemType": Terrasoft.ViewItemType.DETAIL
						}
					},
					{
						"operation": "insert",
						"parentName": "GeneralInfoTab",
						"propertyName": "items",
						"name": "ContactAddress",
						"values": {
							"itemType": Terrasoft.ViewItemType.DETAIL
						}
					},
					{
						"operation": "insert",
						"parentName": "GeneralInfoTab",
						"propertyName": "items",
						"name": "ContactAnniversary",
						"values": {
							"itemType": Terrasoft.ViewItemType.DETAIL
						}
					},
					{
						"operation": "insert",
						"parentName": "GeneralInfoTab",
						"propertyName": "items",
						"name": "Relationships",
						"values": {
							"itemType": Terrasoft.ViewItemType.DETAIL
						}
					},
					{
						"operation": "insert",
						"parentName": "JobTabContainer",
						"propertyName": "items",
						"name": "ContactCareer",
						"values": {
							"itemType": Terrasoft.ViewItemType.DETAIL
						}
					},
					{
						"operation": "insert",
						"parentName": "NotesAndFilesTab",
						"propertyName": "items",
						"name": "Files",
						"values": {
							"itemType": Terrasoft.ViewItemType.DETAIL
						}
					},
					{
						"operation": "insert",
						"name": "NotesControlGroup",
						"parentName": "NotesAndFilesTab",
						"propertyName": "items",
						"values": {
							"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
							"items": [],
							"caption": {"bindTo": "Resources.Strings.NotesGroupCaption"}
						}
					},
					{
						"operation": "insert",
						"parentName": "NotesControlGroup",
						"propertyName": "items",
						"name": "Notes",
						"values": {
							"contentType": Terrasoft.ContentType.RICH_TEXT,
							"layout": {"column": 0, "row": 0, "colSpan": 24},
							"labelConfig": {
								"visible": false
							},
							"controlConfig": {
								"imageLoaded": {
									"bindTo": "insertImagesToNotes"
								},
								"images": {
									"bindTo": "NotesImagesCollection"
								}
							}
						}
					}
				]/**SCHEMA_DIFF*/
			};
		});
