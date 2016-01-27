define('ProcessRemindModule', ['ext-base', 'terrasoft', 'sandbox', 'Activity', 'ProcessModule',
	'profile!processRemindModuleCollapsed', 'ProcessRemindModuleResources', 'ProcessModuleUtilities'],
	function(Ext, Terrasoft, sandbox, Activity, ProcessModule, profile, resources, ProcessModuleUtilities) {

		var profileKey = 'processRemindModuleCollapsed';
		var processExecDataCollection = [];

		function getContainerConfig(id) {
			return {
				className: 'Terrasoft.Container',
				items: [],
				id: id,
				selectors: {
					wrapEl: '#' + id
				}
			};
		}

		var getImageConfig = function(name, className) {
			var imageConfig = resources.localizableImages[name];
			var imageUrl = Terrasoft.ImageUrlBuilder.getUrl(imageConfig);
			var htmlImg = '<img id = "' + name + '-img-control" class = "' + className + '" src="' + imageUrl + '">';
			return {
				className: 'Terrasoft.Component',
				html: htmlImg,
				selectors: {
					wrapEl: '#' + name + '-img-control'
				}
			};
		};

		var getLabelConfig = function(caption, labelClass, tag, bindTo) {
			return {
				className: 'Terrasoft.Label',
				caption: caption,
				labelClass: labelClass,
				tag: tag,
				click: {
					bindTo: bindTo
				}
			};
		};

		function getStepsCaptionGroupItems(items) {
			var currExecDataItemKey = processExecDataCollection.currentProcElUId;
			var currentExecDataProcElUId = processExecDataCollection[currExecDataItemKey].procElUId;
			var i = 0;
			var executionDataItem = {};
			for (var propertyName in processExecDataCollection) {
				if (!processExecDataCollection.hasOwnProperty(propertyName)) {
					continue;
				}
				if (propertyName === 'previousProcElUId'){
					continue;
				}
				executionDataItem = processExecDataCollection[propertyName];
				if (!executionDataItem) {
					continue;
				}
				if ((typeof executionDataItem  === 'function') || Ext.isEmpty(executionDataItem.procElUId)) {
					continue;
				}
				i++;
				var container = getContainerConfig('executionDataItem' + i);
				container.classes = {
					wrapClassName: 'custom-view-container'
				};
				var imageName = 'ArrowGray';
				var labelClass = 't-label-gray';
				if (executionDataItem.procElUId === currentExecDataProcElUId) {
					imageName = 'ArrowBlue';
					labelClass = 't-label-blue';
				}
				container.items.push(getImageConfig(imageName, 'img-user-class'));
				container.items.push(
					getLabelConfig(executionDataItem.recommendation, labelClass, executionDataItem, 'executePrcEl'));
				items.push(container);
			}
		}

		function getView() {
			var viewConfig = getContainerConfig('reminderContainer');
			Ext.apply(viewConfig, {
				visible: {
					bindTo: 'reminderContainerVisible'
				}
			});
			var leftContainer = getContainerConfig('leftContainer');
			var stepsCaption = resources.localizableStrings.StepsCaption +
				' (' + ProcessModuleUtilities.getProcExecDataCollectionCount(processExecDataCollection) + ')';
			var stepsCaptionGroup = {
				className: 'Terrasoft.ControlGroup',
				id: 'stepsCaption',
				selectors: {
					wrapEl: '#stepsCaption'
				},
				collapsed: profile === true || false,
				collapsedchanged: {
					bindTo: 'remindContainerCollapsedChanged'
				},
				bottomLine: false,
				caption: stepsCaption,
				captionInUppercase: false,
				markerValue: stepsCaption,
				classes: {
					wrapContainerClass: 'control-group-container'
				},
				items: []
			};
			Ext.apply(leftContainer, {
				items: [
					stepsCaptionGroup
				]
			});
			getStepsCaptionGroupItems(stepsCaptionGroup.items);
			var rightContainer = getContainerConfig('rightContainer');
			Ext.apply(rightContainer, {
				items: [
					{
						id: 'hideReminder-btn',
						className: 'Terrasoft.Button',
						classes: {
							wrapperClass: 'detail-delete-btn-user-class'
						},
						imageConfig: resources.localizableImages.HideIcon,
						style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
						selectors: {
							wrapEl: '#hideReminder-btn'
						},
						click: {
							bindTo: 'hideReminder'
						}
					}
				]
			});
			viewConfig.items = [leftContainer, rightContainer];
			return  Ext.create('Terrasoft.Container', viewConfig);
		}

		function getViewModel() {
			var viewModel = Ext.create('Terrasoft.BaseViewModel', {
				values: {
					reminderContainerVisible: true
				},
				methods: {
					executePrcEl: function(tag) {
						ProcessModule.changeCurrentProcExecItemInHistoryState(tag);
					},
					hideReminder: function() {
						viewModel.set('reminderContainerVisible', false);
					},
					remindContainerCollapsedChanged: function(newValue) {
						profile = newValue;
						Terrasoft.utils.saveUserProfile(profileKey, profile, false);
					}
				}
			});
			return viewModel;
		}

		function render(renderTo) {
			processExecDataCollection = sandbox.publish('GetProcessExecDataCollection');
			var view = getView();
			var viewModel = getViewModel();
			viewModel.set('stepsCaption', resources.localizableStrings.StepsCaption);
			viewModel.set('reminderContainerVisible', true);
			view.bind(viewModel);
			view.render(renderTo);
		}

		return {
			render: render
		};

	});