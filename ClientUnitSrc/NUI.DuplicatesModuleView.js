define("DuplicatesModuleView", ["ext-base", "terrasoft", "DuplicatesModuleViewResources"],
	function(Ext, Terrasoft, resources) {
		/*var entitySchemaName;*/
		function generate(entitySchemaName) {
			this.entitySchemaName = entitySchemaName;

			var columnsConfig = [];
			if (entitySchemaName === "Account") {
				columnsConfig = [{
					cols: 6,
					key: [{
						name: resources.localizableStrings["GridTitle" + this.entitySchemaName],
						type: "caption"
					}, {
						name: {
							bindTo: "Name"
						}
					}]
				}, {
					cols: 6,
					key: [{
						name: resources.localizableStrings.GridTitleAccountPhone,
						type: "caption"
					}, {
						name: {
							bindTo: "Phone"
						}
					}]
				}, {
					cols: 6,
					key: [{
						name: resources.localizableStrings.GridTitleAccountAdditionalPhone,
						type: "caption"
					}, {
						name: {
							bindTo: "AdditionalPhone"
						}
					}]
				}, {
					cols: 6,
					key: [{
						name: resources.localizableStrings.GridTitleAccountWeb,
						type: "caption"
					}, {
						name: {
							bindTo: "Web"
						}
					}]
				}];
			} else {
				columnsConfig = [{
					cols: 6,
					key: [{
						name: resources.localizableStrings["GridTitle" + this.entitySchemaName],
						type: "caption"
					}, {
						name: {
							bindTo: "Name"
						}
					}]
				}, {
					cols: 6,
					key: [{
						name: resources.localizableStrings.GridTitleContactMobilePhone,
						type: "caption"
					}, {
						name: {
							bindTo: "MobilePhone"
						}
					}]
				}, {
					cols: 6,
					key: [{
						name: resources.localizableStrings.GridTitleContactHomePhone,
						type: "caption"
					}, {
						name: {
							bindTo: "HomePhone"
						}
					}]
				}, {
					cols: 6,
					key: [{
						name: resources.localizableStrings.GridTitleContactEmail,
						type: "caption"
					}, {
						name: {
							bindTo: "Email"
						}
					}]
				}];
			}

			function getActionsConfig(actions, id) {
				return {
					className: "Terrasoft.Container",
					id: id || "settings-container",
					selectors: {
						wrapEl: "#" + (id || "settings-container")
					},
					items: [
						{
							id: "settings-buttom",
							selectors: {
								wrapEl: "#settings-buttom"
							},
							className: "Terrasoft.Button",
							/*classes: {
								wrapperClass: ["open-button-wrapperEl"],
								imageClass: ["open-button-image-size"],
								markerClass: ["open-button-markerEl"]
							},*/
							caption: resources.localizableStrings.SettingsButtonCaption,
							/*style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
							imageConfig: resources.localizableImages.ImageOpenButton,
							margin: "0px 10px 0px 0px",*/
							menu: {
								items: actions
							}
						}
					]
				};
			}

			var viewConfig = {
				id: "duplicatesModuleContainer",
				selectors: {
					wrapEl: "#duplicatesModuleContainer"
				},
				items: [{
					className: "Terrasoft.Container",
					id: "buttonsContainer",
					selectors: {
						wrapEl: "#buttonsContainer"
					},
					items: [{
						className: "Terrasoft.Button",
						id: "startButton",
						caption: resources.localizableStrings.StartCaption,
						style: Terrasoft.controls.ButtonEnums.style.GREEN,
						tag: "StartButton",
						markerValue: "StartButton",
						enabled: {
							bindTo: "startButtonEnabled"
						},
						click: {
							bindTo: "onStartClick"
						}
					}, {
						className: "Terrasoft.Button",
						id: "stopButton",
						caption: resources.localizableStrings.StopCaption,
						tag: "StopButton",
						enabled: {
							bindTo: "stopButtonEnabled"
						},
						click: {
							bindTo: "onStopClick"
						}
					}, {
						className: "Terrasoft.Button",
						id: "cancelButton",
						caption: resources.localizableStrings.CancelButtonCaption,
						tag: "CancelButton",
						click: {
							bindTo: "cancelClick"
						}
					}, getActionsConfig([{
						caption: resources.localizableStrings.ScheduleCaption,
						tag: "ScheduleButton",
						click: {
							bindTo: "onScheduleClick"
						}
					}])]
				}, {
					className: "Terrasoft.Container",
					id: "DescriptionContainer",
					selectors: {
						wrapEl: "#DescriptionContainer"
					},
					items: [{
						className: "Terrasoft.Label",
						caption: {
							bindTo: "statusDescription"
						}
					}]
				}, {
					className: "Terrasoft.Container",
					id: "gridContainer",
					selectors: {
						wrapEl: "#gridContainer"
					},
					items: [{
						id: "duplicateGrid",
						className: "Terrasoft.Grid",
						type: "tiled",
						watchRowInViewport: 2,
						multiSelect: true,
						primaryColumnName: "Id",
						hierarchical: true,
						hierarchicalColumnName: "Parent",
						columnsConfig: [columnsConfig],
						activeRow: {
							bindTo: "activeRow"
						},
						selectedRows: {
							bindTo: "selectedRows"
						},
						/*
						selectRow: {
							bindTo: "onRowsSelectionChanged"
						},
						unSelectRow: {
							bindTo: "onRowsSelectionChanged"
						},*/
						isLoading: {
							bindTo: "gridLoading"
						},
						isEmpty: {
							bindTo: "gridEmpty"
						},
						watchedRowInViewport: {
							bindTo: "loadNext"
						},
						collection: {
							bindTo: "gridData"
						},
						activeRowAction: {
							bindTo: "onActiveRowAction"
						},
						expandHierarchyLevels: {
							bindTo: "expandHierarchyLevels"
						},
						updateExpandHierarchyLevels: {
							bindTo: "onExpandHierarchyLevels"
						},
						activeRowActions: [{
							className: "Terrasoft.Button",
							style: Terrasoft.controls.ButtonEnums.style.BLUE,
							caption: resources.localizableStrings.MergeButtonCaption,
							tag: "MergeDuplicate",
							enabled: {
								bindTo: "getGridButtonEnabled"
							},
							visible: {
								bindTo: "getGridButtonVisible"
							}
						}, {
							className: "Terrasoft.Button",
							caption: resources.localizableStrings.NotDuplicatesButtonCaption,
							tag: "IsNotDuplicate",
							enabled: {
								bindTo: "getGridButtonEnabled"
							},
							visible: {
								bindTo: "getGridButtonVisible"
							}
						}]
					}]
				}]
			};
			return viewConfig;
		}

		function getMainHeaderCaption(entitySchemaName) {
			return resources.localizableStrings[entitySchemaName + "Caption"];
		}

		return {
			generate: generate,
			getMainHeaderCaption: getMainHeaderCaption
		};
	});