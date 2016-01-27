define("MergeDuplicatesPageView", ["ext-base", "terrasoft", "MergeDuplicatesPageViewResources",
	"CardViewGenerator"], function(Ext, Terrasoft, resources, CardViewGenerator) {

		function generate(viewModelConfig) {
			var attributesConfig = [];
			var entityColumns = viewModelConfig.values.entityColumns;
			var entitySchema = viewModelConfig.entitySchema;
			Terrasoft.each(entityColumns, function(columnName) {
				var column = viewModelConfig.entitySchema.columns[columnName];

				var itemConfig = {
					type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
					name: columnName,
					columnPath: columnName,
					dataValueType: column.dataValueType
				};

				var labelConfig = CardViewGenerator.generateLabelConfig(entitySchema, itemConfig, {});
				var controlConfig = CardViewGenerator.generateControlConfig(entitySchema, itemConfig, {}, {});

				attributesConfig.push({
					className: "Terrasoft.Container",
					id: "attribute" + columnName + "Container",
					selectors: {
						wrapEl: "#attribute" + columnName + "Container"
					},
					visible: {
						bindTo: columnName + "BoxEnabled"
					},
					classes: {
						wrapClassName: "attributeContainer"
					},
					items: [
						{
							className: "Terrasoft.Container",
							id: "attribute" + columnName + "LeftContainer",
							selectors: {
								wrapEl: "#attribute" + columnName + "LeftContainer"
							},
							classes: {
								wrapClassName: "leftContainer"
							},
							items: [labelConfig, controlConfig]
						},
						{
							className: "Terrasoft.Container",
							id: "attribute" + columnName + "RightContainer",
							selectors: {
								wrapEl: "#attribute" + columnName + "RightContainer"
							},
							classes: {
								wrapClassName: "rightContainer"
							},
							items: []
						}
					]
				});
			}, this);

			var viewConfig = {
				id: "mergeDuplicatesContainer",
				selectors: {
					wrapEl: "#mergeDuplicatesContainer"
				},
				items: [
					{
						className: "Terrasoft.Container",
						id: "buttonsContainer",
						selectors: {
							wrapEl: "#buttonsContainer"
						},
						items: [
							{
								className: "Terrasoft.Button",
								id: "acceptButton",
								caption: resources.localizableStrings.AcceptButtonCaption,
								style: Terrasoft.controls.ButtonEnums.style.GREEN,
								tag: "AcceptButton",
								enabled: {
									bindTo: "isEdit"
								},
								click: {
									bindTo: "onAcceptClick"
								}
							},
							{
								className: "Terrasoft.Button",
								id: "cancelButton",
								caption: resources.localizableStrings.CancelButtonCaption,
								tag: "CancelButton",
								enabled: {
									bindTo: "isEdit"
								},
								click: {
									bindTo: "onCancelClick"
								}
							}
						]
					},
					{
						className: "Terrasoft.Container",
						id: "descriptionContainer",
						selectors: {
							wrapEl: "#descriptionContainer"
						},
						items: [
							{
								className: "Terrasoft.Label",
								id: "descriptionLabel",
								caption: resources.localizableStrings.DescriptionCaption
							},
							{
								className: "Terrasoft.Container",
								id: "descriptionRadioChangeContainer",
								selectors: {
									wrapEl: "#descriptionRadioChangeContainer"
								},
								classes: {
									wrapClassName: ["custom-inline"]
								},
								items: [
									{
										className: "Terrasoft.RadioButton",
										tag: "Changed",
										checked: {
											bindTo: "isViewGroup"
										}
									},
									{
										className: "Terrasoft.Label",
										caption: resources.localizableStrings.ViewTypeChangeCaption
									}
								]
							},
							{
								className: "Terrasoft.Container",
								id: "descriptionRadioAllContainer",
								selectors: {
									wrapEl: "#descriptionRadioAllContainer"
								},
								classes: {
									wrapClassName: ["custom-inline"]
								},
								items: [
									{
										className: "Terrasoft.RadioButton",
										tag: "All",
										checked: {
											bindTo: "isViewGroup"
										}
									},
									{
										className: "Terrasoft.Label",
										caption: resources.localizableStrings.ViewTypeAllCaption
									}
								]
							}
						]
					},
					{
						className: "Terrasoft.Container",
						id: "attributesContainer",
						selectors: {
							wrapEl: "#attributesContainer"
						},
						items: attributesConfig
					},
					{
						caption: resources.localizableStrings.CommunicationDetailCaption,
						className: "Terrasoft.ControlGroup",
						classes: {
							wrapContainerClass: ["control-group-container"]
						},
						collapsed: true,
						visible: true,
						id: "communicationGroupContainer",
						selectors: {
							wrapEl: "#communicationGroupContainer"
						},
						items: []
					},
					{
						caption: resources.localizableStrings.AddressDetailCaption,
						className: "Terrasoft.ControlGroup",
						classes: {
							wrapContainerClass: ["control-group-container"]
						},
						collapsed: true,
						visible: true,
						id: "addressGroupContainer",
						selectors: {
							wrapEl: "#addressGroupContainer"
						},
						items: []
					}
				]
			};

			return viewConfig;
		}
		function getHeaderCaption(entitySchemaName) {
			return resources.localizableStrings[entitySchemaName + "Caption"];
		}

		return {
			generate: generate,
			getHeaderCaption: getHeaderCaption
		};
	});