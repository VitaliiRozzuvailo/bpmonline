define("RecommendationModule", ["RecommendationModuleResources", "ext-base", "terrasoft", "sandbox"],
	function(Resources, Ext, Terrasoft, sandbox) {

	function getView(execData) {
		var containerName = "displayingInformationContainer";
		var viewConfig = {
			className: "Terrasoft.Container",
			items: [],
			id: containerName,
			selectors: {
				wrapEl: "#" + containerName
			}
		};
		if (execData.recommendation) {
			var recommendation = {
				className: "Terrasoft.Label",
				classes: {
					labelClass: ["information", "recommendation"]
				},
				caption: {
					bindTo: "recommendation"
				},
				markerValue: {
					bindTo: "recommendation"
				}
			};
			viewConfig.items.push(recommendation);
		}
		if (execData.informationOnStep) {
			var informationOnStepButton = {
				className: "Terrasoft.Button",
				style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
				classes: {
					wrapperClass: "informationOnStep-button",
					imageClass: "informationOnStep-button-image"
				},
				imageConfig: {
					source: Terrasoft.ImageSources.URL,
					url: Terrasoft.ImageUrlBuilder.getUrl(Resources.localizableImages.InformationOnStep)
				},
				click: {
					bindTo: "showInformationOnStep"
				},
				markerValue: "InformationOnStep"
			};
			viewConfig.items.push(informationOnStepButton);
		}
		return Ext.create("Terrasoft.Container", viewConfig);
	}

	function getViewModel() {
		return Ext.create("Terrasoft.BaseViewModel", {
			values: {
				recommendation: "",
				informationOnStep: ""
			},
			methods: {
				showInformationOnStep: function() {
					this.showInformationDialog(this.get("informationOnStep"));
					return false;
				}
			}
		});
	}

	function render(renderTo) {
		var processExecData = sandbox.publish("GetProcessExecData");
		if (processExecData && (processExecData.recommendation || processExecData.informationOnStep)) {
			var recommendation = processExecData.recommendation ||
				Resources.localizableStrings.DefaultInformationOnStep;
			var informationOnStep = processExecData.informationOnStep || null;
			var view = getView({
				"recommendation": recommendation,
				"informationOnStep": informationOnStep
			});
			var viewModel = getViewModel();
			viewModel.set("recommendation", recommendation);
			viewModel.set("informationOnStep", informationOnStep);
			view.bind(viewModel);
			view.render(renderTo);
		}
	}

	return {render: render};
});