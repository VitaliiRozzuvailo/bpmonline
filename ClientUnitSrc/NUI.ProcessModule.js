define('ProcessModule', ['ext-base', 'terrasoft', 'sandbox', 'ProcessModuleResources', 'ProcessModuleUtilities',
	'MaskHelper'],
	function(Ext, Terrasoft, sandbox, resources, ProcessModuleUtilities, MaskHelper) {

		var processExecData = {};

		function init() {
			sandbox.subscribe('ProcessExecDataChanged', onProcessExecDataChanged);
			sandbox.subscribe('GetProcessExecData', onGetProcessExecData);
			sandbox.subscribe('GetProcessExecDataCollection', onGetProcessExecDataCollection);
			sandbox.subscribe('GetProcessEntryPointsData', onGetProcessEntryPointsData);
			Terrasoft.ServerChannel.on(Terrasoft.EventName.ON_MESSAGE, onNextProcessElementReady, this);
			var currentState = sandbox.publish('GetHistoryState');
			if (currentState && currentState.state && currentState.state.executionData) {
				processExecData = currentState.state.executionData;
			}
		}

		function replaceHistoryState(currentState, newState) {
			processExecData = newState.executionData;
			sandbox.publish('ReplaceHistoryState', {
				stateObj: newState,
				pageTitle: null,
				hash: currentState.hash.historyState,
				silent: true
			});
		}

		function onNextProcessElementReady(scope, procExecDataMessage) {
			MaskHelper.HideBodyMask();
			if (procExecDataMessage.Header.Sender === 'ProcessEngine') {
				var currentState = sandbox.publish('GetHistoryState');
				var isProcessMode = !Ext.isEmpty(currentState.hash.historyState.match('/prc$'));
				var nextProcExecData = Ext.decode(procExecDataMessage.Body);
				var nextProcessId = nextProcExecData.processId;
				if (isProcessMode === false ||
					Ext.isEmpty(processExecData.processId) || processExecData.processId === nextProcessId) {
					if (isProcessMode === false) {
						processExecData = {};
					}
					processExecData = Ext.apply({}, processExecData, nextProcExecData);
				} else {
					return;
				}
				changeNextProcExecDataHistoryState(processExecData);
			} else if (procExecDataMessage.Header.Sender === 'ProcessEngineBackHistoryState') {
				Terrasoft.Router.back();
			}
		}

		function changeCurrentProcExecItemInHistoryState(processExecDataItem) {
			var navigationEventName = 'PushHistoryState';
			var currentState = sandbox.publish('GetHistoryState');
			var newState = Terrasoft.deepClone(currentState.state || {});
			newState.executionData.currentProcElUId = processExecDataItem.procElUId;
			processExecData = newState.executionData;
			changeHistoryState(processExecDataItem, currentState, newState);
		}

		function changeNextProcExecDataHistoryState(nextProcessExecData) {
			var currentState = sandbox.publish('GetHistoryState');
			var newState = Terrasoft.deepClone(currentState.state || {});
			var previousProcElUId = nextProcessExecData.currentProcElUId;
			var currentProcElUId;
			Terrasoft.each(nextProcessExecData, function(procExecDataItem) {
				if (currentProcElUId) {
					return;
				}
				if (procExecDataItem &&
					(typeof procExecDataItem !== 'function') &&
					procExecDataItem.procElUId !== previousProcElUId) {
					currentProcElUId = procExecDataItem.procElUId;
				}
			}, this);
			nextProcessExecData.currentProcElUId = currentProcElUId;
			nextProcessExecData.previousProcElUId = nextProcessExecData[previousProcElUId];
			delete nextProcessExecData[previousProcElUId];
			newState.executionData = nextProcessExecData;
			processExecData = nextProcessExecData;
			var processExecDataItem = nextProcessExecData[nextProcessExecData.currentProcElUId];
			changeHistoryState(processExecDataItem, currentState, newState);
		}

		function changeHistoryState(processExecDataItem, currentState, newState) {
			if (Ext.isEmpty(processExecDataItem)) {
				Terrasoft.Router.back();
				return;
			}
			var navigationEventName = 'PushHistoryState';
			var token = '';
			if (currentState && currentState.hash &&
				currentState.hash.historyState.match('/prc/?') ||
				processExecDataItem.isProcessExecutedBySignal === true) {
				navigationEventName = 'ReplaceHistoryState';
			}
			if (processExecDataItem.urlToken) {
				token = processExecDataItem.urlToken;
			} else {
				var config = Terrasoft.configuration.ModuleStructure[processExecDataItem.entitySchemaName];
				var cardSchemaName = config.cardSchema;
				if (config.pages) {
					Terrasoft.each(config.pages, function(page) {
						if (processExecDataItem.pageTypeId === page.UId && page.cardSchema) {
							cardSchemaName = page.cardSchema;
						}
					}, this);
				}
				var recordId = processExecDataItem.recordId || processExecDataItem.activityRecordId;
				if (processExecDataItem.action === 'add') {
					newState.defaultValues = processExecDataItem.defaultValues || {};
					newState.defaultValues['Id'] = recordId;
					if (!Ext.isEmpty(processExecDataItem.pageTypeId)) {
						token = config.cardModule + '/' + cardSchemaName + '/add/Type/' +
							processExecDataItem.pageTypeId;
					}
				}
				if (Ext.isEmpty(token)) {
					var action = processExecDataItem.action || 'edit';
					token = config.cardModule + '/' + cardSchemaName + '/' + action + '/' +
						recordId;
				}
				token = token + '/prc';
			}
			sandbox.publish(navigationEventName, {
				stateObj: newState,
				pageTitle: null,
				hash: token
			});
		}

		function getDetailInstanceId(cardModuleSandbox, detailItemName, entitySchemaName) {
			return cardModuleSandbox.id + '_' + entitySchemaName + '_detail_' + detailItemName;
		}

		function saveExecutionContext(executionContext, cardModuleSandbox){
			var details = Ext.decode(executionContext);
			Terrasoft.each(details, function(detail) {
				if (!detail.collapsed) {
					var detailInstanceId = getDetailInstanceId(cardModuleSandbox, detail.name, detail.filterPath);
					cardModuleSandbox.publish('SaveDetails', null, [detailInstanceId]);
				}
			});
		}

		function onCardModuleSaved(item, cardModuleSandbox) {
			var currentState = sandbox.publish('GetHistoryState');
			var state = currentState.state || {};
			var newState = Terrasoft.deepClone(state);
			var executionData = newState.executionData;
			var currentExecDataItem =  executionData.previousProcElUId;
			if (Ext.isEmpty(currentExecDataItem)) {
				currentExecDataItem = executionData[executionData.currentProcElUId];
				delete executionData[executionData.currentProcElUId];
				delete executionData.currentProcElUId;
			} else {
				delete executionData.previousProcElUId;
			}
			if (!Ext.isEmpty(currentExecDataItem.executionContext)) {
				saveExecutionContext(currentExecDataItem.executionContext, cardModuleSandbox);
			}
			replaceHistoryState(currentState, newState);
			if (currentExecDataItem && currentExecDataItem.completeExecution === true) {
				item.nextPrcElReady = true;
				completeExecution(this, currentExecDataItem.procElUId, null,
					function(success, completeExecutionData) {
						if (completeExecutionData &&
							!completeExecutionData.nextPrcElReady) {
							var currentState = sandbox.publish('GetHistoryState');
							var state = currentState.state || {};
							var executionData = state.executionData;
							if (ProcessModuleUtilities.getProcExecDataCollectionCount(executionData) > 0) {
								changeNextProcExecDataHistoryState(executionData);
							} else {
								Terrasoft.Router.back();
							}
						}
					});
			} else if (item && item.nextPrcElReady === false &&
					ProcessModuleUtilities.getProcExecDataCollectionCount(executionData) > 0) {
				item.nextPrcElReady = true;
				var select = Ext.create('Terrasoft.EntitySchemaQuery', {
					rootSchemaName: 'SysProcessData'
				});
				select.addColumn('Id');
				select.getEntity(executionData.processId, function(result) {
					var entity = result.entity;
					var currentState = sandbox.publish('GetHistoryState');
					var state = currentState.state || {};
					var executionData = state.executionData;
					if (entity && ProcessModuleUtilities.getProcExecDataCollectionCount(executionData) > 0) {
						changeNextProcExecDataHistoryState(executionData);
					} else {
						Terrasoft.Router.back();
					}
				}, this);
			}
		}

		function removeProcExecDataItem(procElUId) {
			delete processExecData[procElUId];
		}

		function onProcessExecDataChanged(data) {
			getProcessExecData(this, data);
		}

		function onGetProcessEntryPointsData(dataSend) {
			callConfigurationServiceMethod('ProcessEngineService/GetProcessEntryPointsData',
				{
					entitySchemaUId: dataSend.entitySchemaUId,
					entityId: dataSend.recordId
				},
                function(response) {
                    dataSend.callback.call(dataSend.scope, response['GetProcessEntryPointsDataResult']);
                });
		}

		function onGetProcessExecData() {
			return processExecData[processExecData.currentProcElUId];
		}

		function onGetProcessExecDataCollection() {
			return processExecData;
		}

		function getProcessExecData(scope, data) {
			// TODO Переименовать метод сервиса GetExecutionData
			Terrasoft.AjaxProvider.request({
				url: '../ServiceModel/ProcessEngineService.svc/' +
					'GetExecutionData?ProcElUId=' + data.procElUId + '&RecordId=' + data.recordId,
				method: 'POST',
				scope: scope,
				callback: function(request, success, response) {
					if (success) {
						var nextProcessExecData = Ext.decode(Ext.decode(response.responseText));
						if (nextProcessExecData.status) {
							if (nextProcessExecData.status === '404') {
								data.scope.showInformationDialog.call(data.scope, nextProcessExecData.message);
								return;
							}
							if (window.console && window.console.log) {
								var elementNotFoundMessage = resources.localizableStrings
									.ElementNotFoundByUIdExceptionMessage.replace('{0}', data.procElUId);
								window.console.log(elementNotFoundMessage);
							}
							if (data.parentMethod) {
								data.parentMethod.call(data.scope, data.parentMethodArguments);
							}
						} else {
							processExecData = {
								processId: nextProcessExecData.processId
							};
							processExecData[data.procElUId] = nextProcessExecData;
							changeNextProcExecDataHistoryState(processExecData);
						}
					}
				}
			});
		}

		function callConfigurationServiceMethod(serviceMethodName, dataSend, callback) {
			var data = dataSend || {};
			var requestUrl = Terrasoft.workspaceBaseUrl + '/rest/'+ serviceMethodName;
			var request = Terrasoft.AjaxProvider.request({
				url: requestUrl,
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				method: 'POST',
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
				},
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
				url: '../ServiceModel/ProcessEngineService.svc/' + procElUId +
					'/CompleteExecution' + (params || ''),
				method: 'POST',
				scope: this,
				callback: responseCallback
			});
		}

		function cancelExecution(scope, data, callback) {
			scope = scope || this;
			Terrasoft.AjaxProvider.request({
				url: '../ServiceModel/ProcessEngineService.svc/CancelExecution',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				method: 'POST',
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

		return {
			'init': init,
			replaceHistoryState: replaceHistoryState,
			changeNextProcExecDataHistoryState: changeNextProcExecDataHistoryState,
			changeCurrentProcExecItemInHistoryState: changeCurrentProcExecItemInHistoryState,
			removeProcExecDataItem: removeProcExecDataItem,
			onCardModuleSaved: onCardModuleSaved,
			services: services
		};
	});