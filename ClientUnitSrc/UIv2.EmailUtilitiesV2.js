define("EmailUtilitiesV2", ["ext-base", "terrasoft", "EmailUtilitiesV2Resources"],
	function(Ext, Terrasoft, resources) {
		function callEmailSendService(callback, dataSend) {
			var data = dataSend || {};
			var requestUrl = Terrasoft.workspaceBaseUrl + "/rest/EmailSendService/Send";
			Terrasoft.AjaxProvider.request({
				url: requestUrl,
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json"
				},
				method: "POST",
				jsonData: data,
				callback: function(request, success, response) {
					var responseObject = success ? Terrasoft.decode(response.responseText) : {};
					responseObject.success = success;
					callback.call(this, responseObject);
				},
				scope: this
			});
		}

		function send(activityId, callback) {
			var dataSend = {
				ActivityId: activityId
			};
			var maskId = Terrasoft.Mask.show({
				caption: resources.localizableStrings.Sending
			});
			callEmailSendService.call(this, function(response) {
				Terrasoft.Mask.hide(maskId);
				var responseArray = response.SendResult;
				var gridData = this.getGridData ? this.getGridData() : null;
				var isEmptyResponseData = Ext.isEmpty(responseArray) || responseArray.length <= 0;
				if (isEmptyResponseData || responseArray[0].Code === "ErrorOnSend") {
					Terrasoft.utils.showConfirmation(resources.localizableStrings.SendEmailError);
				} else if (gridData && responseArray[0].Code === "Sended") {
					Terrasoft.utils.showConfirmation(resources.localizableStrings.Success);
				}
				if (isEmptyResponseData) {
					return;
				}
				var emailEntity = this;
				if (gridData) {
					this.loadGridDataRecord(activityId);
					emailEntity = gridData.get(activityId);
				}
				var result = responseArray[0];
				emailEntity.set("EmailSendStatus", {
					displayValue: result.DisplayValue,
					value: result.Value
				});
				if (!callback) {
					return;
				}
				if (result.HasFollowingProcessElement) {
					response.nextPrcElReady = result.HasFollowingProcessElement;
					response.success = true;
				}
				callback.call(this, response);
			}, dataSend);
		}

		return {
			send: send
		};
	});