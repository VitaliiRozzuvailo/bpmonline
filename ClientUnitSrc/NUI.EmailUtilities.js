define('EmailUtilities', ['ext-base', 'terrasoft', 'sandbox', 'EmailUtilitiesResources'],
	function(Ext, Terrasoft, sandbox, resources) {
		function callServiceMethod(ajaxProvider, methodName, callback, dataSend) {
			var provider = ajaxProvider;
			var data = dataSend || {};
			var requestUrl = Terrasoft.workspaceBaseUrl + '/rest/EmailSendService/' + methodName;
			provider.request({
				url: requestUrl,
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				method: 'POST',
				jsonData: data,
				callback: function(request, success, response) {
					var responseObject = {};
					if (success) {
						responseObject = Terrasoft.decode(response.responseText);
					}
					callback.call(this, responseObject);
				},
				scope: this
			});
		}

		function send(activityId, scope, callback) {
			scope.sendEmailResult = 'ErrorOnSend';
			var needShowMessage = Ext.isEmpty(scope.needShowMessage) ? true : scope.needShowMessage;
			var dataSend = {
				ActivityId: activityId
			};
			var ajaxProvider = Terrasoft.AjaxProvider;
			var maskId = Terrasoft.Mask.show({
				caption: resources.localizableStrings.Sending
			});
			callServiceMethod(ajaxProvider, 'Send', function(response) {
				Terrasoft.Mask.hide(maskId);
				var responseArray = response.SendResult;
				var gridData = scope.get('gridData');
				if (needShowMessage && (Ext.isEmpty(responseArray) || responseArray.length <= 0 ||
					responseArray[0].Code === 'ErrorOnSend')) {
					Terrasoft.utils.showConfirmation(resources.localizableStrings.SendEmailError);
				} else if (gridData && needShowMessage && responseArray[0].Code === 'Sended') {
					Terrasoft.utils.showConfirmation(resources.localizableStrings.Success);
				}
				if (Ext.isEmpty(responseArray) || responseArray.length <= 0) {
					return;
				}
				var result = responseArray[0];
				var itemConfig = {
					displayValue: result.DisplayValue,
					value: result.Value
				};
				if (gridData) {
					scope.loadByUId(activityId);
					var activeRow = gridData.get(activityId);
					activeRow.set('EmailSendStatus', itemConfig);
				}
				else {
					scope.set('EmailSendStatus', itemConfig);
				}
				if (!callback) {
					return;
				}
				var item = null;
				if (!Ext.isEmpty(result.HasFollowingProcessElement)) {
					item = {
						nextPrcElReady: result.HasFollowingProcessElement,
						success: true
					};
				}
				callback.call(scope, item);
			}, dataSend);
		}

		return {
			send: send
		};
	});