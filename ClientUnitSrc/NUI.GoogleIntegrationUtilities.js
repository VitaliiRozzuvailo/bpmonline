define("GoogleIntegrationUtilities", ["ConfigurationConstants", "GoogleIntegrationUtilitiesResources",
		"SocialAccountAuthUtilities"],
	function(ConfigurationConstants, resources, AuthUtilities) {

		var localizableStrings = resources.localizableStrings;

		/**
		 * Обновляет данные, связанные с предыдущей учетной записью Google.
		 * @param {String} socialAccountId Идентификатор новой учетной записи Google.
		 * @param {Function} callback Функция обратного вызова.
		 */
		function updatePreviousGoogleSocialAccounts(socialAccountId, callback) {
			getPreviousSocialAccountId(socialAccountId, function(prevSocialAccountId) {
				deleteCurrentGoogleSocialAccount(socialAccountId, function() {
					updateContactAndActivityCorrespondence(socialAccountId, prevSocialAccountId, function() {
						getSocialAccountLogin(function(login) {
							addContactCommunicationForCurrentUser(login, callback);
						});
					});
				});
			});
		}

		/**
		 * Удаляет старую учетную запись Google в системе.
		 * @param {String} newSocialAccountId Идентификатор новой учетной записи Google.
		 * @param {Function} callback Функция обратного вызова.
		 */
		function deleteCurrentGoogleSocialAccount(newSocialAccountId, callback) {
			var deleteQuery = Ext.create("Terrasoft.DeleteQuery", {
				rootSchemaName: "SocialAccount"
			});
			deleteQuery.filters.add("IdFilter",
				deleteQuery.createColumnFilterWithParameter(Terrasoft.ComparisonType.NOT_EQUAL, "Id",
					newSocialAccountId));
			deleteQuery.filters.add("userFilter",
				deleteQuery.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,	"User",
					Terrasoft.SysValue.CURRENT_USER.value));
			deleteQuery.filters.add("TypeIdFilter",
				deleteQuery.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL, "Type",
					ConfigurationConstants.CommunicationType.Google));
			deleteQuery.execute(function() {
				if (Ext.isFunction(callback)) {
					callback();
				}
			});
		}

		/**
		 * Обновляет записи в ContactCorrespondence и ActivityCorrespondence значением новой учетной записи Google.
		 * @param {String} socialAccountId Идентификатор новой учетной записи Google.
		 * @param {String} prevSocialAccountId Идентификатор предыдущей учетной записи Google.
		 * @param {Function} callback Функция обратного вызова.
		 */
		function updateContactAndActivityCorrespondence(socialAccountId, prevSocialAccountId, callback) {
			if (Ext.isEmpty(prevSocialAccountId)) {
				return;
			}
			updateContactCorrespondence(socialAccountId, prevSocialAccountId, function() {
				updateActivityCorrespondence(socialAccountId, prevSocialAccountId, callback);
			});
		}

		/**
		 * Обновляет записи в ContactCorrespondence значением новой учетной записи Google.
		 * @param {String} socialAccountId Идентификатор новой учетной записи Google.
		 * @param {String} prevSocialAccountId Идентификатор предыдущей учетной записи Google.
		 * @param {Function} callback Функция обратного вызова.
		 */
		function updateContactCorrespondence(socialAccountId, prevSocialAccountId, callback) {
			var updateQuery = Ext.create("Terrasoft.UpdateQuery", {
				rootSchemaName: "ContactCorrespondence"
			});
			var filters = updateQuery.filters;
			var sourceAccountFilter = Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
				"SourceAccount", prevSocialAccountId);
			filters.add("IdFilter", sourceAccountFilter);
			updateQuery.setParameterValue("SourceAccount", socialAccountId, Terrasoft.DataValueType.LOOKUP);
			updateQuery.execute(function() {
				if (Ext.isFunction(callback)) {
					callback();
				}
			});
		}

		/**
		 * Обновляет записи в ActivityCorrespondence значением новой учетной записи Google.
		 * @param {String} socialAccountId Идентификатор новой учетной записи Google.
		 * @param {String} prevSocialAccountId Идентификатор предыдущей учетной записи Google.
		 * @param {Function} callback Функция обратного вызова.
		 */
		function updateActivityCorrespondence(socialAccountId, prevSocialAccountId, callback) {
			var updateQuery = Ext.create("Terrasoft.UpdateQuery", {
				rootSchemaName: "ActivityCorrespondence"
			});
			var filters = updateQuery.filters;
			var sourceAccountFilter = Terrasoft.createColumnFilterWithParameter(
				Terrasoft.ComparisonType.EQUAL,	"SourceAccount", prevSocialAccountId);
			filters.add("IdFilter", sourceAccountFilter);
			updateQuery.setParameterValue("SourceAccount", socialAccountId,	Terrasoft.DataValueType.GUID);
			updateQuery.execute(function() {
				if (Ext.isFunction(callback)) {
					callback();
				}
			});
		}

		/**
		 * Запрашивает идентификатор предыдущей учетной записи Google и вызывает callback.
		 * @param {String} socialAccountId Идентификатор социальной сети.
		 * @param {Function} callback Функция обратного вызова.
		 */
		function getPreviousSocialAccountId(socialAccountId, callback) {
			var selectQuery = Ext.create("Terrasoft.EntitySchemaQuery", {
				rootSchemaName: "SocialAccount"
			});
			selectQuery.addColumn("Id");
			selectQuery.filters.add("NotIdFilter",
				selectQuery.createColumnFilterWithParameter(Terrasoft.ComparisonType.NOT_EQUAL,
				"Id", socialAccountId));
			selectQuery.filters.add("userFilter",
				selectQuery.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
					"User", Terrasoft.SysValue.CURRENT_USER.value));
			selectQuery.filters.add("TypeIdFilter",
				selectQuery.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL, "Type",
					ConfigurationConstants.CommunicationType.Google));
			selectQuery.getEntityCollection(function(response) {
				var prevSocialAccountId = "";
				var entities = response.collection;
				if (entities.getCount() > 0) {
					prevSocialAccountId = entities.getByIndex(0).get("Id");
				}
				if (Ext.isFunction(callback)) {
					callback(prevSocialAccountId);
				}
			}, this);
		}

		/**
		 * Запрашивает логин учетной записи Google пользователя.
		 * @param {Function} callback Функция обратного вызова.
		 */
		function getSocialAccountLogin(callback) {
			var select = Ext.create("Terrasoft.EntitySchemaQuery", {
				rootSchemaName: "SocialAccount"
			});
			select.addColumn("Login");
			select.filters.add("UserIdFilter", select.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
				"User", Terrasoft.SysValue.CURRENT_USER.value));
			select.filters.add("TypeIdFilter", select.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
				"Type", ConfigurationConstants.CommunicationType.Google));
			select.getEntityCollection(function(response) {
				var login;
				if (response.success) {
					var entities = response.collection;
					if (entities.getCount() > 0) {
						login = entities.getByIndex(0).get("Login");
					}
				}
				if (Ext.isFunction(callback)) {
					callback(login);
				}
			});

		}

		/**
		 * Добавляет средство связи типа Email для учетной записи пользователя в Google.
		 * @param {String} login Название учетной записи Google.
		 * @param {Function} callback Функция обратного вызова.
		 */
		function addContactCommunicationForCurrentUser(login, callback) {
			if (Ext.isEmpty(login)) {
				return;
			}
			var select = Ext.create("Terrasoft.EntitySchemaQuery", {
				rootSchemaName: "ContactCommunication"
			});
			select.addColumn("Id");
			select.filters.add("NumberFilter",
				select.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL, "Number", login));
			select.filters.add("CurrentUserFilter",
				select.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL, "Contact",
					Terrasoft.SysValue.CURRENT_USER_CONTACT.value));
			select.getEntityCollection(function(response) {
				if (response.collection.getCount() === 0) {
					var insert = Ext.create("Terrasoft.InsertQuery", {
						rootSchemaName: "ContactCommunication"
					});
					var id = Terrasoft.utils.generateGUID();
					insert.setParameterValue("Id", id, Terrasoft.DataValueType.GUID);
					insert.setParameterValue("Contact", Terrasoft.SysValue.CURRENT_USER_CONTACT.value,
						Terrasoft.DataValueType.GUID);
					insert.setParameterValue("Number", login, Terrasoft.DataValueType.TEXT);
					insert.setParameterValue("CommunicationType", ConfigurationConstants.CommunicationType.Email,
						Terrasoft.DataValueType.GUID);
					insert.execute(function() {
						if (Ext.isFunction(callback)) {
							callback(login);
						}
					});
				} else {
					if (Ext.isFunction(callback)) {
						callback(login);
					}
				}
			});
		}

		/**
		 * Открывает страницу авторизации в Google и обновляет данные об учетной записи в системе.
		 * @param {Function} callback (optional) Функция, вызываемая после успешной авторизации.
		 * @public
		 */
		function showGoogleAuthenticationWindow(callback) {
			AuthUtilities.checkSysSettingsAndOpenWindow("Google", this.sandbox,
				function(data, login, socialNetworkId, socialAccountId) {
					updatePreviousGoogleSocialAccounts(socialAccountId, callback);
				});
		}

		return {
			showGoogleAuthenticationWindow: function(callback) {
				return showGoogleAuthenticationWindow(callback);
			},
			localizableStrings: localizableStrings
		};
	});