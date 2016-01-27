define('GlobalDuplicateModuleView', ['ext-base', 'terrasoft',
	'GlobalDuplicateModuleViewResources'],
	function(Ext, Terrasoft, resources) {
	var entitySchemaName;
	function generate(entitySchemaName) {
		this.entitySchemaName = entitySchemaName;

		var columnsConfig = [];
		if (entitySchemaName === 'Account') {
			columnsConfig = [{
				cols: 6,
				key: [{
					name: resources.localizableStrings['GridTitle' + this.entitySchemaName],
					type: 'caption'
				}, {
					name: {
						bindTo: 'Name'
					}
				}]
			}, {
				cols: 6,
				key: [{
					name: resources.localizableStrings.GridTitleAccountPhone,
					type: 'caption'
				}, {
					name: {
						bindTo: 'Phone'
					}
				}]
			}, {
				cols: 6,
				key: [{
					name: resources.localizableStrings.GridTitleAccountAdditionalPhone,
					type: 'caption'
				}, {
					name: {
						bindTo: 'AdditionalPhone'
					}
				}]
			}, {
				cols: 6,
				key: [{
					name: resources.localizableStrings.GridTitleAccountWeb,
					type: 'caption'
				}, {
					name: {
						bindTo: 'Web'
					}
				}]
			}];
		} else {
			columnsConfig = [{
				cols: 6,
				key: [{
					name: resources.localizableStrings['GridTitle' + this.entitySchemaName],
					type: 'caption'
				}, {
					name: {
						bindTo: 'Name'
					}
				}]
			}, {
				cols: 6,
				key: [{
					name: resources.localizableStrings.GridTitleContactMobilePhone,
					type: 'caption'
				}, {
					name: {
						bindTo: 'MobilePhone'
					}
				}]
			}, {
				cols: 6,
				key: [{
					name: resources.localizableStrings.GridTitleContactHomePhone,
					type: 'caption'
				}, {
					name: {
						bindTo: 'HomePhone'
					}
				}]
			}, {
				cols: 6,
				key: [{
					name: resources.localizableStrings.GridTitleContactEmail,
					type: 'caption'
				}, {
					name: {
						bindTo: 'Email'
					}
				}]
			}];
		}

		var viewConfig = {
			id: 'globalDuplicateModuleView',
			className: 'Terrasoft.Container',
			selectors: {
				wrapEl: '#globalDuplicateModuleView'
			},
			items: [{
				className: 'Terrasoft.Container',
				id: 'buttonsContainer',
				selectors: {
					wrapEl: '#buttonsContainer'
				},
				items: [{
					className: 'Terrasoft.Button',
					id: 'startButton',
					caption: resources.localizableStrings.StartCaption,
					style: Terrasoft.controls.ButtonEnums.style.GREEN,
					tag: 'StartButton',
					enabled: {
						bindTo: 'duplicateStartEnabled'
					},
					click: {
						bindTo: 'onDuplicateStartClick'
					}
				}, {
					className: 'Terrasoft.Button',
					id: 'stopButton',
					caption: resources.localizableStrings.StopCaption,
					style: Terrasoft.controls.ButtonEnums.style.BLUE,
					tag: 'StopButton',
					enabled: {
						bindTo: 'duplicateStopEnabled'
					},
					click: {
						bindTo: 'onDuplicateStopClick'
					}
				}, {
					className: 'Terrasoft.Button',
					id: 'scheduleButton',
					caption: resources.localizableStrings.ScheduleCaption,
					style: Terrasoft.controls.ButtonEnums.style.GREY,
					tag: 'ScheduleButton',
					enabled: {
						bindTo: 'duplicateScheduleEnabled'
					},
					click: {
						bindTo: 'onDuplicateScheduleClick'
					}
				}]
			}, {
				className: 'Terrasoft.Container',
				id: 'descriptionContainer',
				selectors: {
					wrapEl: '#descriptionContainer'
				},
				items: [{
					className: 'Terrasoft.Label',
					id: 'captionLabel',
					caption: {
						bindTo: 'getStatusDescription'
					}
				}]
			}, {
				className: 'Terrasoft.Container',
				id: 'gridContainer',
				selectors: {
					wrapEl: '#gridContainer'
				},
				items: [{
					id: 'duplicateGrid',
					className: 'Terrasoft.Grid',
					type: 'tiled',
					watchRowInViewport: 2,
					multiSelect: true,
					primaryColumnName: 'Id',
					hierarchical: true,
					hierarchicalColumnName: 'Parent',
					activeRow: {
						bindTo: 'activeRow'
					},
					isLoading: {
						bindTo: 'gridLoading'
					},
					watchedRowInViewport: {
						bindTo: 'loadNext'
					},
					columnsConfig: [columnsConfig],
					collection: {
						bindTo: 'duplicateGridData'
					}
				}]
			}]
		};
		return viewConfig;
	}

	return {
		generate: generate
	};
});