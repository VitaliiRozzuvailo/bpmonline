define('LoadProcessModules', ['ext-base', 'terrasoft', 'ProcessModuleUtilities'],
	function(Ext, Terrasoft, ProcessModuleUtilities) {


		return {

			loadProcessModules: function loadProcessModules(sandbox, isProcessMode) {
				if (isProcessMode === false) {
					return;
				}
                sandbox.subscribe('GetCardModuleSandboxId', function() {
                    return sandbox.id;
                });
				var processExecData = sandbox.publish('GetProcessExecData');
				var processExecDataCollection = sandbox.publish('GetProcessExecDataCollection');
				if (Ext.isEmpty(processExecData)) {
					return;
				}
                if (processExecDataCollection &&
						ProcessModuleUtilities.getProcExecDataCollectionCount(processExecDataCollection) > 1 ) {
                    var remindContainer = Ext.get('process-reminder');
                    sandbox.loadModule('ProcessRemindModule', {
                        renderTo: remindContainer
                    });
                }
				var entitySchemaName = processExecData.entitySchemaName;
				if ((entitySchemaName && entitySchemaName !== 'Activity') || processExecData.userQuestion) {
					var recommendationContainer = Ext.get('usertask-recommendation');
					sandbox.loadModule('RecommendationModule', {
						renderTo: recommendationContainer
					});
				}
				var processExecContextContainer = Ext.get('processExecutionContextContainer');
                    sandbox.loadModule('ProcessExecutionContextModule', {
					renderTo: processExecContextContainer
				});
			},

			isDelayExecutionButtonVisible: function isDelayExecutionButtonVisible(sandbox, isProcessMode) {
				if (isProcessMode === true) {
					var processExecData = sandbox.publish('GetProcessExecData');
					if (processExecData && (processExecData.entitySchemaName !== 'Activity')) {
						return true;
					}
				}
				return false;
			}

		};
	});