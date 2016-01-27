define("SummarySettingsViewGenerator", ["ext-base", "terrasoft", "SummarySettingsViewGeneratorResources"],
	function(Ext, Terrasoft, resources) {

		function generateRow(renderTo, key) {
			var view = {
				renderTo: renderTo,
				id: "row-summary-settings-view-" + key,
				selectors: {
					el: "#row-summary-settings-view-" + key,
					wrapEl: "#row-summary-settings-view-" + key
				},
				classes: {
					wrapClassName: ["grid-listed-row", "label-grid-listed-row"]
				},
				items: [
					{
						className: "Terrasoft.Container",
						id: "path-container" + key,
						selectors: {
							wrapEl: "#path-container" + key
						},
						classes: {
							wrapClassName: ["grid-cols-9", "grid-cols-summary"]
						},
						items: [
							{
								className: "Terrasoft.Label",
								classes: {
									labelClass: ["row-label-column"]
								},
								caption: {
									bindTo: "path"
								}
							},
							{
								className: "Terrasoft.Label",
								caption: {
									bindTo: "columnPath"
								},
								visible: false
							}
						]
					},
					{
						className: "Terrasoft.Container",
						id: "combo-box-container" + key,
						selectors: {
							wrapEl: "#combo-box-container" + key
						},
						classes: {
							wrapClassName: ["grid-cols-6", "grid-cols-summary-button"]
						},
						items: [
							{
								className: "Terrasoft.Button",
								style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
								caption: {
									bindTo: "funcSelectedCaption"
								},
								classes: {
									wrapperClass: ["function-button"]
								},
								menu: {
									items: [
										{
											caption: {
												bindTo: "funcSumCaption"
											},
											click: {
												bindTo: "functionChanged"
											},
											visible : {
												bindTo: "funcSumVisible"
											},
											tag: "SUM"
										},
										{
											caption: {
												bindTo: "funcAvgCaption"
											},
											click: {
												bindTo: "functionChanged"
											},
											visible : {
												bindTo: "funcAvgVisible"
											},
											tag: "AVG"
										},
										{
											caption: {
												bindTo: "funcMaxCaption"
											},
											click: {
												bindTo: "functionChanged"
											},
											visible : {
												bindTo: "funcMaxVisible"
											},
											tag: "MAX"
										},
										{
											caption: {
												bindTo: "funcMinCaption"
											},
											click: {
												bindTo: "functionChanged"
											},
											visible : {
												bindTo: "funcMinVisible"
											},
											tag: "MIN"
										}
									]
								}
							}
						]
					},
					{
						className: "Terrasoft.Container",
						id: "caption-container" + key,
						selectors: {
							wrapEl: "#caption-container" + key
						},
						classes: {
							wrapClassName: ["grid-cols-9"]
						},
						items: [
							{
								className: "Terrasoft.Container",
								id: "display-caption-container" + key,
								selectors: {
									wrapEl: "#display-caption-container" + key
								},
								classes: {
									wrapClassName: ["display-caption-container"]
								},
								visible: {
									bindTo: "displayCaptionContainerVisible"
								},
								items: [
									{
										className: "Terrasoft.Label",
										classes: {
											labelClass: ["row-label-column"]
										},
										caption: {
											bindTo: "columnCaption"
										},
										click: {
											bindTo: "captionLabelClick"
										}
									},
									{
										className: "Terrasoft.Button",
										style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
										imageConfig: resources.localizableImages.ImageDeleteButton,
										classes: {
											wrapperClass: ["delete-button-wrapperEl"],
											imageClass: ["delete-button-image-size"]
										},
										click: {
											bindTo: "deleteRow"
										},
										markerValue: {
											bindTo: "columnCaption"
										}
									}
								]
							},
							{
								className: "Terrasoft.Container",
								id: "edit-caption-container" + key,
								selectors: {
									wrapEl: "#edit-caption-container" + key
								},
								classes: {
									wrapClassName: ["edit-caption-container"]
								},
								visible: {
									bindTo: "editCaptionContainerVisible"
								},
								items: [
									{
										className: "Terrasoft.Container",
										id: "edit-buttons-caption-container" + key,
										selectors: {
											wrapEl: "#edit-buttons-caption-container" + key
										},
										classes: {
											wrapClassName: ["edit-buttons-caption-container"]
										},
										items: [
											{
												className: "Terrasoft.Button",
												style: Terrasoft.controls.ButtonEnums.style.BLUE,
												imageConfig: resources.localizableImages.ImageConfirmButton,
												classes: {
													wrapperClass: ["edit-button-wrapperEl"],
													imageClass: ["edit-button-image-size"]
												},
												click: {
													bindTo: "confirmChangeCaption"
												}
											},
											{
												className: "Terrasoft.Button",
												style: Terrasoft.controls.ButtonEnums.style.DEFAULT,
												imageConfig: resources.localizableImages.ImageDiscardButton,
												classes: {
													wrapperClass: ["edit-button-wrapperEl"],
													imageClass: ["edit-button-image-size"]
												},
												click: {
													bindTo: "discardChangeCaption"
												}
											}
										]
									},
									{
										className: "Terrasoft.Container",
										id: "edit-text-caption-container" + key,
										selectors: {
											wrapEl: "#edit-text-caption-container" + key
										},
										classes: {
											wrapClassName: ["edit-text-caption-container"]
										},
										items: [
											{
												id: "caption-edit-" + key,
												className: "Terrasoft.TextEdit",
												classes: {
													wrapClass: ["caption-edit"]
												},
												value: {
													bindTo: "columnEditCaption"
												},
												keydown: {
													bindTo: "keyPressed"
												}
											}
										]
									}
								]
							}
						]
					}
				]
			};
			return view;
		}

		function generate(renderTo) {
			var view = {
				id: "main-summary-settings-view",
				selectors: {
					el: "#main-summary-settings-view",
					wrapEl: "#main-summary-settings-view"
				},
				items: [
					{
						className: "Terrasoft.Container",
						id: "top-container",
						selectors: {
							wrapEl: "#top-container"
						},
						classes: {
							wrapClassName: ["top-container"]
						},
						items: [
							{
								className: "Terrasoft.Button",
								style: Terrasoft.controls.ButtonEnums.style.GREEN,
								caption: resources.localizableStrings.SaveButtonCaption,
								classes: {
									textClass: ["main-buttons"]
								},
								click: {
									bindTo: "saveToProfile"
								}
							},
							{
								className: "Terrasoft.Button",
								style: Terrasoft.controls.ButtonEnums.style.DEFAULT,
								caption: resources.localizableStrings.CancelButtonCaption,
								classes: {
									textClass: ["main-buttons"]
								},
								click: {
									bindTo: "cancel"
								}
							},
							{
								className: "Terrasoft.Button",
								style: Terrasoft.controls.ButtonEnums.style.BLUE,
								caption: resources.localizableStrings.AddButtonCaption,
								classes: {
									wrapperClass: ["main-buttons"]
								},
								click: {
									bindTo: "addRow"
								}
							},
							{
								className: "Terrasoft.Container",
								id: "check-box-container",
								selectors: {
									wrapEl: "#check-box-container"
								},
								classes: {
									wrapClassName: ["check-box-container"]
								},
								items: [
									{
										id: "summary-count-check-box",
										className: "Terrasoft.CheckBoxEdit",
										checked: {
											bindTo: "isChecked"
										},
										markerValue: resources.localizableStrings.DisplayRecordCountCaption
									},
									{
										className: "Terrasoft.Label",
										caption: resources.localizableStrings.DisplayRecordCountCaption,
										classes: {
											labelClass: ["check-box-label"]
										},
										inputId : "summary-count-check-box-el",
										width: "auto"
									}
								]
							},
							{
								className: "Terrasoft.Container",
								id: "table-grid-container",
								selectors: {
									wrapEl: "#table-grid-container"
								},
								classes: {
									wrapClassName: ["grid"]
								},
								items: [
									{
										className: "Terrasoft.Container",
										id: "table-grid-caption-container",
										selectors: {
											wrapEl: "#table-grid-caption-container"
										},
										classes: {
											wrapClassName: ["grid-captions", "grid-captions-summary"]
										},
										items: [
											{
												className: "Terrasoft.Label",
												caption: resources.localizableStrings.ColumnHeaderCaption,
												classes: {
													labelClass: ["grid-cols-9", "caption-label-column"]
												}
											},
											{
												className: "Terrasoft.Label",
												caption: resources.localizableStrings.ColumnFuncCaption,
												classes: {
													labelClass: ["grid-cols-6", "caption-label-column"]
												}
											},
											{
												className: "Terrasoft.Label",
												caption: resources.localizableStrings.ColumnTitleCaption,
												classes: {
													labelClass: ["grid-cols-9", "caption-label-column"]
												}
											}
										]
									}
								]
							}
						]
					}
				]
			};
			return view;
		}

		return {
			generate: generate,
			generateRow: generateRow
		};
	});

