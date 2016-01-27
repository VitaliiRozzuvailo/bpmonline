function returnAccessTokens(accessToken, accessSecretToken, socialId, userId) {
	var SocialAccountAuthUtilities = require('SocialAccountAuthUtilities');
	SocialAccountAuthUtilities.createSocialAccount(accessToken, accessSecretToken, socialId, userId);
}

function returnAuthErrorMessage(message) {
	var SocialAccountAuthUtilities = require('SocialAccountAuthUtilities');
	if (message == null || message == '') {
		message = SocialAccountAuthUtilities.localizableStrings.SocialNetworkAuthError;
	}
	Terrasoft.utils.showInformation(Ext.String.htmlDecode(message), function() {}, this);
}

define('SocialAccountAuthUtilities', ['SocialAccountAuthUtilitiesResources'],
	function(resources) {

		var socialNetworkName = '';
		var consumerKey = '';
		var afterAuthFunction;
		var localizableStrings = resources.localizableStrings;

		function getKeysSysSettingsValues(itemValues, socialNetwork, sandbox) {
			consumerKey = itemValues[socialNetwork + 'ConsumerKey'];
			var consumerSecret = itemValues[socialNetwork + 'ConsumerSecret'];
			if (consumerKey != '' && consumerSecret != '') {
				gotoOldOAuthAuthenticationUrl(socialNetwork);
			} else {
				//OpenSocialNetworkAuthWindow(socialNetwork, sandbox);
				Terrasoft.utils.showInformation(resources.localizableStrings.QueryAdministartor + socialNetwork, function() {}, this);
			}
		}

		function checkSysSettingsAndOpenWindow(socialNetwork, sandbox, callAfter) {
			if (callAfter != undefined) {
				afterAuthFunction = callAfter;
			}
			socialNetworkName = socialNetwork;
			var settingsProvider = Terrasoft.SysSettings;
			var arrayToQuery = [socialNetwork + 'ConsumerKey', socialNetwork + 'ConsumerSecret'];
			var funcCallBack = function(itemValues) {
				getKeysSysSettingsValues(itemValues, socialNetwork, sandbox);
			};
			settingsProvider.querySysSettings(arrayToQuery, funcCallBack);
		}

		function gotoOldOAuthAuthenticationUrl(socialNetworkName, callAfter) {
			if (callAfter != undefined) {
				afterAuthFunction = callAfter;
			}
			var data = {
				socialNetworkName: socialNetworkName
			};
			var requestUrl = Terrasoft.workspaceBaseUrl + '/rest/SocialNetworksUtilitiesService/GetOldOAuthAuthenticationUrl';
			Ext.Ajax.request({
				url: requestUrl,
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				method: 'POST',
				jsonData: data,
				success: function(response, opts){
					var url = Terrasoft.decode(response.responseText);
					url += '&socialNetwork=' + opts.jsonData.socialNetworkName
						+ '&userId=d2559e6a-1ea1-df11-b73a-001d60e938c6';
					window.open(url);
				},
				scope: this
			});
		}

		function createSocialAccount(accessToken, accessSecretToken, socialId, userId) {
			var data = {
				socialNetworkName: socialNetworkName,
				socialId: socialId,
				accessToken: accessToken,
				accessSecretToken: accessSecretToken,
				userId: userId
			};
			var requestUrl = Terrasoft.workspaceBaseUrl + '/rest/SocialNetworksUtilitiesService/GetSocialNetworkLogin';
			Ext.Ajax.request({
				url: requestUrl,
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				method: 'POST',
				jsonData: data,
				success: function(response, opts) {
					var login = Terrasoft.decode(response.responseText);
					setSocialNetworkIdAndLogin(opts.jsonData, login, socialNetworkName);
				},
				failure: function(response, opts) {
				},
				scope: this
			});
		}

		function insertSocialAccount(data, login, socialNetworkId, isPublic, id, callback, scope) {
			var insert = Ext.create('Terrasoft.InsertQuery', {
				rootSchemaName: 'SocialAccount'
			});
			insert.setParameterValue("Id", id, Terrasoft.DataValueType.GUID);
			insert.setParameterValue("User", data.userId, Terrasoft.DataValueType.GUID);
			insert.setParameterValue("Login", login, Terrasoft.DataValueType.TEXT);
			insert.setParameterValue("AccessToken", data.accessToken, Terrasoft.DataValueType.TEXT);
			insert.setParameterValue("AccessSecretToken", data.accessSecretToken, Terrasoft.DataValueType.TEXT);
			insert.setParameterValue("SocialId", data.socialId, Terrasoft.DataValueType.TEXT);
			insert.setParameterValue("Type", socialNetworkId, Terrasoft.DataValueType.GUID);
			insert.setParameterValue("ConsumerKey", consumerKey, Terrasoft.DataValueType.TEXT);
			insert.setParameterValue("Public", isPublic, Terrasoft.DataValueType.BOOLEAN);
			insert.execute(function(response) {
				if (!response.success) {
					return;
				}
				if (callback) {
					callback.call(scope || this);
				}
			}, this);
		}

		function setSocialNetworkIdAndLogin(data, login, socialNetwork) {
			var confirmationMessage = localizableStrings.SetIsPublisSocialAccount;
			var select = Ext.create('Terrasoft.EntitySchemaQuery', {
				rootSchemaName: 'CommunicationType'
			});
			select.addColumn('Id');
			select.addColumn('Name');
			var filters = Ext.create('Terrasoft.FilterGroup');
			filters.addItem(select.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
				'Name', socialNetwork));
			select.filters = filters;
			select.getEntityCollection(function(result) {
				var collection = result.collection;
				if (!Ext.isEmpty(collection)) {
					var socialNetworkId = collection.collection.items[0].values.Id;
					var socialAccountId = Terrasoft.utils.generateGUID();
					insertSocialAccount(data, login, socialNetworkId, false, socialAccountId, function() {
						if (afterAuthFunction) {
							afterAuthFunction.call(this, data, login, socialNetworkId, socialAccountId);
						}
						deletExpiredSocialAccounts();
					}, this);
				}
			}, this);
		}

		function deletExpiredSocialAccounts() {
			var deleteQuery = Ext.create('Terrasoft.DeleteQuery', {
				rootSchemaName: 'SocialAccount'
			});
			deleteQuery.filters.add('UserIdFilter', deleteQuery.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
				'User', Terrasoft.SysValue.CURRENT_USER.value));
			deleteQuery.filters.add('IsExpiredFilter', deleteQuery.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
				'IsExpired', true));
			deleteQuery.execute(function(response) {}, this);
		}

		function OpenSocialNetworkAuthWindow(socialNetwork, sandbox){
			var params = sandbox.publish('GetHistoryState');
			sandbox.publish('PushHistoryState', {hash: params.hash.historyState,
				stateObj: {
					socialNetwork: socialNetwork
				}});
			var pageId = sandbox.id + '_SocialAccountAuthModule';
			sandbox.loadModule('SocialAccountAuthModule', {
				renderTo: Ext.get('centerPanel'),
				id: pageId,
				keepAlive: true
			});
		}

		function renewConsumerKey(consumerkey) {
			consumerKey = consumerkey;
		}

		return {
			checkSysSettingsAndOpenWindow: function(socialNetwork, sandbox, afterAuthFunction) {
				return checkSysSettingsAndOpenWindow(socialNetwork, sandbox, afterAuthFunction);
			},
			gotoOldOAuthAuthenticationUrl: function (socialNetworkName, callback) {
				return gotoOldOAuthAuthenticationUrl(socialNetworkName, callback);
			},
			createSocialAccount: function (accessToken, accessSecretToken, socialId, userId) {
				return createSocialAccount(accessToken, accessSecretToken, socialId, userId);
			},
			afterAuthFunction: afterAuthFunction,
			localizableStrings: localizableStrings,
			renewConsumerKey: function(consumerKey) {
				return renewConsumerKey(consumerKey);
			}
		};
	});
	