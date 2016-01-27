define("ProcessModuleV2", ["ext-base", "terrasoft", "sandbox", "ProcessModuleV2Resources",
		"ProcessModuleUtilities", "ProcessHelper", "MaskHelper"],
	function(Ext, Terrasoft, sandbox, resources, ProcessModuleUtilities, ProcessHelper, MaskHelper) {

		var processCardModuleName = "ProcessCardModuleV2";
		var isProcessModeRegExp = processCardModuleName + "/?";

		function init() {
			sandbox.subscribe("ProcessExecDataChanged", onProcessExecDataChanged);
			sandbox.subscribe("GetProcessExecData", onGetProcessExecData);
			sandbox.subscribe("GetProcessEntryPointsData", onGetProcessEntryPointsData);
			Terrasoft.ServerChannel.on(Terrasoft.EventName.ON_MESSAGE, onNextProcessElementReady, this);
		}

		function replaceHistoryState(currentState, newState) {
			sandbox.publish("ReplaceHistoryState", {
				stateObj: newState,
				pageTitle: null,
				hash: currentState.hash.historyState,
				silent: true
			});
		}

		function onNextProcessElementReady(scope, procExecDataMessage) {
			if (procExecDataMessage.Header.Sender === "ProcessEngine") {
				MaskHelper.HideBodyMask();
				var currentState = sandbox.publish("GetHistoryState");
				var isNew = Ext.isEmpty(currentState.hash.historyState.match(isProcessModeRegExp));
				var nextProcExecData = Ext.decode(procExecDataMessage.Body);
				var nextProcessId = nextProcExecData.processId;
				var processExecData = (currentState.state && currentState.state.executionData) || {};
				if (isNew === true ||
					Ext.isEmpty(processExecData.processId) || processExecData.processId === nextProcessId) {
					if (isNew === true) {
						processExecData = {};
					}
					processExecData = Ext.apply({}, processExecData, nextProcExecData);
					processExecData.isNew = isNew;
				} else {
					return;
				}
				changeNextProcExecDataHistoryState(processExecData);
			} else if (procExecDataMessage.Header.Sender === "ProcessEngineBackHistoryState") {
				Terrasoft.Router.back();
			}
		}

		function changeCurrentProcExecItemInHistoryState(processExecDataItem) {
			var currentState = sandbox.publish("GetHistoryState");
			var newState = Terrasoft.deepClone(currentState.state || {});
			newState.executionData.currentProcElUId = processExecDataItem.procElUId;
			changeHistoryState(processExecDataItem, currentState, newState);
		}

		function changeNextProcExecDataHistoryState(nextProcessExecData) {
			var currentState = sandbox.publish("GetHistoryState");
			var newState = Terrasoft.deepClone(currentState.state || {});
			var previousProcElUId = nextProcessExecData.currentProcElUId;
			var currentProcElUId;
			Terrasoft.each(nextProcessExecData, function(procExecDataItem) {
				if (currentProcElUId) {
					return;
				}
				if (procExecDataItem && (typeof procExecDataItem !== "function") &&
					procExecDataItem.procElUId !== previousProcElUId) {
					currentProcElUId = procExecDataItem.procElUId;
				}
			}, this);
			nextProcessExecData.currentProcElUId = currentProcElUId;
			delete nextProcessExecData[previousProcElUId];
			newState.executionData = nextProcessExecData;
			var processExecDataItem = nextProcessExecData[nextProcessExecData.currentProcElUId];
			changeHistoryState(processExecDataItem, currentState, newState);
		}

		function changeHistoryState(processExecDataItem, currentState, newState) {
			if (Ext.isEmpty(processExecDataItem)) {
				Terrasoft.Router.back();
				return;
			}
			var navigationEventName = "PushHistoryState";
			var historyState = currentState.hash.historyState;
			if (historyState.match(isProcessModeRegExp) || (processExecDataItem.isProcessExecutedBySignal === true) ||
					(newState.executionData.showNextPrcEl === false)) {
				navigationEventName = "ReplaceHistoryState";
			}
			var showNextPrcEl = newState.executionData.showNextPrcEl || !isInCardMode(currentState.state);
			showNextPrcEl = showNextPrcEl ||
				(newState.executionData.isNew === true) && (!processExecDataItem.isProcessExecutedBySignal);
			var token = historyState;
			if (showNextPrcEl) {
				if (processExecDataItem.urlToken) {
					token = processExecDataItem.urlToken;
				} else {
					var config = Terrasoft.configuration.ModuleStructure[processExecDataItem.entitySchemaName];
					var cardSchemaName = config.cardSchema;
					if (config.attribute) {
						processExecDataItem.typeColumnName = config.attribute;
					}
					Terrasoft.each(config.pages, function(page) {
						if (processExecDataItem.pageTypeId === page.UId && page.cardSchema) {
							cardSchemaName = page.cardSchema;
						}
					}, this);
					if (processExecDataItem.action === "add") {
						newState.valuePairs = getDefaultValues(processExecDataItem);
					}
					var recordId = processExecDataItem.recordId || processExecDataItem.activityRecordId;
					var action = processExecDataItem.action || "edit";
					token = processCardModuleName + "/" + cardSchemaName + "/" + action + "/" + recordId;
					newState.operation = action;
					newState.id = [
						processCardModuleName,
						cardSchemaName,
						processExecDataItem.procElUId
					].join("_");
				}
				token = token + "/" + processExecDataItem.procElUId;
			}
			newState.executionData.showNextPrcEl = false;
			newState.executionData.isOpened = showNextPrcEl;
			sandbox.publish(navigationEventName, {
				stateObj: newState,
				pageTitle: null,
				hash: token,
				silent: !showNextPrcEl
			});
		}

		function isInCardMode(state) {
			return !!state.operation;
		}

		function getDefaultValues(processExecDataItem) {
			var valuePairs = [];
			var recordId = processExecDataItem.recordId || processExecDataItem.activityRecordId;
			if (recordId) {
				valuePairs.push({
					name: "Id",
					value: recordId
				});
			}
			if (processExecDataItem.pageTypeId) {
				valuePairs.push({
					name: processExecDataItem.typeColumnName,
					value: processExecDataItem.pageTypeId
				});
			}
			var defaultValues = processExecDataItem.defaultValues;
			for (var propertyName in defaultValues) {
				if (!defaultValues.hasOwnProperty(propertyName)) {
					continue;
				}
				var propertyValue = defaultValues[propertyName];
				if (propertyValue) {
					var dataValueType = propertyValue.dataValueType;
					if (dataValueType && ProcessHelper.getIsDateTimeDataValueType(dataValueType)) {
						propertyValue = Terrasoft.parseDate(propertyValue.value);
					} else if (propertyValue.value) {
						propertyValue = propertyValue.value;
					}
				}
				valuePairs.push({
					name: propertyName,
					value: propertyValue
				});
			}
			return valuePairs;
		}

		function onCardModuleSaved(nextPrcElReady, cardModuleSandbox, showNextPrcEl) {
			var currentState = sandbox.publish("GetHistoryState");
			var state = currentState.state || {};
			if (Ext.isEmpty(state.executionData) || state.executionData.isOpened) {
				return false;
			}
			var newState = Terrasoft.deepClone(state);
			newState.showNextPrcEl = showNextPrcEl;
			var executionData = newState.executionData;
			executionData.showNextPrcEl = showNextPrcEl;
			if (nextPrcElReady === false && ProcessModuleUtilities.getProcExecDataCollectionCount(executionData) > 0) {
				var select = Ext.create("Terrasoft.EntitySchemaQuery", {
					rootSchemaName: "SysProcessData"
				});
				select.addColumn("Id");
				select.getEntity(executionData.processId, function(result) {
					var entity = result.entity;
					var currentState = sandbox.publish("GetHistoryState");
					var state = currentState.state || {};
					var executionData = state.executionData;
					executionData.showNextPrcEl = showNextPrcEl;
					if (entity && ProcessModuleUtilities.getProcExecDataCollectionCount(executionData) > 0) {
						changeNextProcExecDataHistoryState(executionData);
					} else {
						Terrasoft.Router.back();
					}
				}, this);
			} else if (nextPrcElReady === true) {
				changeHistoryState(executionData[executionData.currentProcElUId], currentState, newState);
			} else {
				return false;
			}
			return true;
		}

		function onProcessExecDataChanged(data) {
			getProcessExecData(this, data);
		}

		function onGetProcessEntryPointsData(dataSend) {
			callConfigurationServiceMethod("ProcessEngineService/GetProcessEntryPointsData",
				{
					entitySchemaUId: dataSend.entitySchemaUId,
					entityId: dataSend.recordId
				},
				function(response) {
					dataSend.callback.call(dataSend.scope, response.GetProcessEntryPointsDataResult);
				});
		}

		function onGetProcessExecData() {
			var currentState = sandbox.publish("GetHistoryState");
			var processExecData = (currentState.state && currentState.state.executionData) || {};
			return processExecData[processExecData.currentProcElUId];
		}

		function getProcessExecData(scope, data) {
			// TODO Переименовать метод сервиса GetExecutionData
			Terrasoft.AjaxProvider.request({
				url: "../ServiceModel/ProcessEngineService.svc/" +
					"GetExecutionData?ProcElUId=" + data.procElUId + "&RecordId=" + data.recordId,
				method: "POST",
				scope: scope,
				callback: function(request, success, response) {
					if (success) {
						var nextProcessExecData = Ext.decode(Ext.decode(response.responseText));
						if (nextProcessExecData.status) {
							if (nextProcessExecData.status === "404") {
								data.scope.showInformationDialog.call(data.scope, nextProcessExecData.message);
								return;
							}
							if (window.console && window.console.log) {
								var elementNotFoundMessage = resources.localizableStrings
									.ElementNotFoundByUIdExceptionMessage.replace("{0}", data.procElUId);
								window.console.log(elementNotFoundMessage);
							}
							if (data.parentMethod) {
								data.parentMethod.call(data.scope, data.parentMethodArguments);
							}
						} else {
							var processExecData = {
								processId: nextProcessExecData.processId,
								isNew: true
							};
							processExecData[data.procElUId] = nextProcessExecData;
							changeNextProcExecDataHistoryState(processExecData);
							if (data.callbackMethod) {
								data.callbackMethod.call(data.scope);
							}
						}
					}
				}
			});
		}

		function callConfigurationServiceMethod(serviceMethodName, dataSend, callback) {
			var data = dataSend || {};
			var requestUrl = Terrasoft.workspaceBaseUrl + "/rest/" + serviceMethodName;
			var request = Terrasoft.AjaxProvider.request({
				url: requestUrl,
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json"
				},
				method: "POST",
				jsonData: data,
				scope: this,
				callback: function(request, success, response) {
					if (!callback) {
						return;
					}
					var responseObject = {};
					if (success) {
						responseObject = Terrasoft.decode(response.responseText);
					}
					callback.call(this, responseObject);
				}
			});
			return request;
		}

		function completeExecution(scope, procElUId, params, callback) {
			MaskHelper.ShowBodyMask();
			var responseCallback = function() {
				MaskHelper.HideBodyMask();
			};
			if (callback) {
				responseCallback = function(request, success, response) {
					MaskHelper.HideBodyMask();
					var completeExecutionData = Ext.decode(Ext.decode(response.responseText));
					callback.call(scope || this, success, completeExecutionData);
				};
			}
			Terrasoft.AjaxProvider.request({
				url: "../ServiceModel/ProcessEngineService.svc/" + procElUId +
					"/CompleteExecution" + (params || ""),
				method: "POST",
				scope: this,
				callback: responseCallback
			});
		}

		function cancelExecution(scope, data, callback) {
			scope = scope || this;
			Terrasoft.AjaxProvider.request({
				url: "../ServiceModel/ProcessEngineService.svc/CancelExecution",
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json"
				},
				method: "POST",
				scope: this,
				jsonData: data,
				callback: function(request, success, response) {
					if (!callback) {
						return;
					}
					callback.call(scope, request, success, response);
				}
			});
		}

		var services = {
			completeExecution: completeExecution,
			cancelExecution: cancelExecution,
			callConfigurationServiceMethod: callConfigurationServiceMethod
		};

		function postponeProcessExecution() {
			var currentState = sandbox.publish("GetHistoryState");
			var newState = Terrasoft.deepClone(currentState.state || {});
			var executionData = newState.executionData;
			delete executionData[executionData.currentProcElUId];
			delete executionData.currentProcElUId;
			replaceHistoryState(currentState, newState);
			if (ProcessModuleUtilities.getProcExecDataCollectionCount(executionData) > 0) {
				changeNextProcExecDataHistoryState(executionData);
			} else {
				Terrasoft.Router.back();
			}
		}


		return {
			init: init,
			replaceHistoryState: replaceHistoryState,
			changeNextProcExecDataHistoryState: changeNextProcExecDataHistoryState,
			changeCurrentProcExecItemInHistoryState: changeCurrentProcExecItemInHistoryState,
			onCardModuleSaved: onCardModuleSaved,
			services: services,
			postponeProcessExecution: postponeProcessExecution
		};
	});