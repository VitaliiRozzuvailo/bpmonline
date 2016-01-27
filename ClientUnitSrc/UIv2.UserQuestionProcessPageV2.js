define("UserQuestionProcessPageV2", ["ProcessModuleV2", "ProcessModuleUtilities", "CustomProcessPageV2Utilities"],
	function(ProcessModule, ProcessModuleUtilities) {
		return {
			mixins: {
				CustomProcessPageV2Utilities: "Terrasoft.CustomProcessPageV2Utilities"
			},
			entitySchemaName: null,
			attributes: {},
			details: /**SCHEMA_DETAILS*/{
			}/**SCHEMA_DETAILS*/,
			methods: {
				/**
				 * Переопределяется инициализия коллекций возможных печатных форм для карточки,
				 * так как не определенна entitySchema
				 * @overridden
				 */
				initCardPrintForms: function(callback, scope) {
					var printMenuItems = this.Ext.create("Terrasoft.BaseViewModelCollection");
					this.set(this.moduleCardPrintFormsCollectionName, printMenuItems);
					if (callback) {
						callback.call(scope || this);
					}
				},
				/**
				 * @overridden
				 */
				onDiscardChangesClick: function() {
					this.sandbox.publish("BackHistoryState");
				},
				/**
				 * @overridden
				 */
				onCloseCardButtonClick: function() {
					this.sandbox.publish("BackHistoryState");
				},
				/**
				 * @protected
				 * @overridden
				 */
				initHeaderCaption: Ext.emptyFn,
				/**
				 * @protected
				 * @overridden
				 */
				initPrintButtonMenu: Ext.emptyFn,
				/**
				 * @protected
				 * @overridden
				 */
				getHeader: function() {
					return this.get("Resources.Strings.HeaderCaption");
				},
				/**
				 * @protected
				 * @overridden
				 */
				init: function() {
					this.set("IsSeparateMode", true);
					this.callParent(arguments);
				},
				/**
				 * @protected
				 * @overridden
				 */
				save: function() {
					var resultDecisions = this.getResultDecisions();
					if (resultDecisions.length === 0 && this.get("isDecisionRequired") === true) {
						this.showInformationDialog(this.get("Resources.Strings.WarningMessage"));
						return false;
					}
					var processData = this.get("ProcessData") || {};
					processData.parameters = processData.parameters || {};
					resultDecisions = Ext.encode(resultDecisions);
					this.set("ResultDecisions", resultDecisions);
					Ext.apply(processData.parameters, {
						ResultDecisions: resultDecisions
					});
					this.acceptProcessElement();
					//resultDecisions = Ext.encode(resultDecisions);
					/*var processElementUId = this.get("processElementUId");
					var currentState = this.sandbox.publish("GetHistoryState");
					var newState = Terrasoft.deepClone(currentState.state || {});
					newState.executionData.showNextPrcEl = true;
					this.sandbox.publish("ReplaceHistoryState", {
						stateObj: newState,
						pageTitle: null,
						hash: currentState.hash.historyState,
						silent: true
					});*/
					/*ProcessModule.services.completeExecution(this, processElementUId,
						"?ResultDecisions=" + resultDecisions,
						function(success, completeExecutionData) {
							var currentState = this.sandbox.publish("GetHistoryState");
							var state = currentState.state || {};
							var executionData = state.executionData;
							var count = ProcessModuleUtilities.getProcExecDataCollectionCount(executionData);
							if ((completeExecutionData && completeExecutionData.nextPrcElReady) ||
								(count === 1 && executionData.currentProcElUId !== processElementUId)) {
								if (executionData.previousProcElUId &&
									executionData.previousProcElUId.procElUId === processElementUId) {
									delete executionData.previousProcElUId;
								}
								return;
							} else {
								if (count === 0 || (count === 1 &&
										executionData.currentProcElUId === processElementUId)) {
									Terrasoft.Router.back();
								} else if (count > 1) {
									ProcessModule.changeNextProcExecDataHistoryState(executionData);
								}
							}
						});*/
				},
				/**
				 * Возвращает выбранные пользователем варианты ответов
				 * @protected
				 */
				getResultDecisions: function() {
					var resultDecisions = [];
					var decisionOptions = this.get("decisionOptions");
					if (this.get("decisionMode") === 0) {
						var decisionName = this.get("radioButtonsGroup");
						Terrasoft.each(decisionOptions, function(decisionOption) {
							if (decisionOption.Name === decisionName) {
								resultDecisions.push(decisionOption.Id);
							}
						});
					} else {
						var scope = this;
						Terrasoft.each(decisionOptions, function(decisionOption) {
							var value = scope.get(decisionOption.Name.toString());
							if (value === true) {
								resultDecisions.push(decisionOption.Id);
							}
						});
					}
					return resultDecisions;
				}
			},
			diff: /**SCHEMA_DIFF*/[
				{
					"operation": "merge",
					"name": "SaveButton",
					"values": {
						"visible": true
					}
				}, {
					"operation": "merge",
					"name": "CloseButton",
					"values": {
						"visible": true
					}
				}, {
					"operation": "remove",
					"name": "actions"
				}, {
					"operation": "remove",
					"name": "back"
				}, {
					"operation": "remove",
					"name": "DiscardChangesButton"
				}, {
					"operation": "remove",
					"name": "Tabs"
				}, {
					"operation": "merge",
					"name": "ActionButtonsContainer",
					"values": {
						"visible": true
					}
				}, {
					"operation": "merge",
					"name": "actions",
					"values": {
						"visible": false
					}
				}, {
					"operation": "remove",
					"name": "BackButton"
				}, {
					"operation": "merge",
					"name": "DiscardChangesButton",
					"values": {
						"visible": true
					}
				}, {
					"operation": "remove",
					"name": "ViewOptionsButton"
				}, {
					"operation": "merge",
					"name": "HeaderCaptionContainer",
					"values": {
						"visible": true
					}
				}, {
					"operation": "remove",
					"name": "Header"
				}, {
					"operation": "insert",
					"name": "UserQuestionContentContainer",
					"parentName": "CardContentContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"items": []
					}
				}, {
					"operation": "insert",
					"parentName": "UserQuestionContentContainer",
					"propertyName": "items",
					"name": "UserQuestionContentBlock",
					"values": {
						"itemType": Terrasoft.ViewItemType.GRID_LAYOUT,
						"items": []
					}
				}
			]/**SCHEMA_DIFF*/,
			userCode: {}
		};
	});