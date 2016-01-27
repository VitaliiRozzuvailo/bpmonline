define("ExtendedFilterEditView", ["ext-base", "terrasoft", "sandbox", "ExtendedFilterEditViewResources"],
	function(Ext, Terrasoft, sandbox, resources) {

		function generateView(renderTo) {
			var closePanelImageUrl =
				Terrasoft.ImageUrlBuilder.getUrl(resources.localizableImages.ClosePanelImage);
			var view = {
				id: "filteredit",
				renderTo: renderTo,
				selectors: {
					wrapEl: "#filteredit"
				},
				items: [
					{
						className: "Terrasoft.Container",
						id: "module-title",
						selectors: {
							el: "#module-title",
							wrapEl: "#module-title"
						},
						items: [
							{
								className: "Terrasoft.Label",
								classes: {
									labelClass: ["extended-filter-caption"]
								},
								caption: {
									bindTo: "getExtendedFilterCaption"
								},
								visible: true
							},
							{
								className: "Terrasoft.Button",
								tag: "CloseButton",
								classes: {
									wrapperClass: ["extended-filter-button-right"]
								},
								style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
								visible: true,
								imageConfig: {
									source: Terrasoft.ImageSources.URL,
									url: closePanelImageUrl
								},
								click: {
									bindTo: "closeExtendedFilter"
								}
							}
						]
					},
					{
						className: "Terrasoft.Container",
						id: "filter-edit-toolbar",
						selectors: {
							el: "#filter-edit-toolbar",
							wrapEl: "#filter-edit-toolbar"
						},
						classes: {
							wrapClassName: "extended-filter-button-container"
						},
						items: [
							{
								className: "Terrasoft.Button",
								caption: resources.localizableStrings.ApplyButtonCaption,
								style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
								click: {
									bindTo: "applyButton"
								}
							},
							{
								className: "Terrasoft.Button",
								caption: resources.localizableStrings.SaveButtonCaption,
								style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
								click: {
									bindTo: "saveButton"
								}
							},
							{
								className: "Terrasoft.Button",
								caption: resources.localizableStrings.ActionsButtonCaption,
								style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
								classes: {
									wrapperClass: ["extended-filter-btn-actions-wrapper"]
								},
								visible: true,
								menu: {
									items: [
										{
											className: "Terrasoft.MenuItem",
											caption: resources.localizableStrings.GroupMenuItemCaption,
											click: {
												bindTo: "groupItems"
											},
											enabled: {
												bindTo: "groupButtonVisible"
											}
										},
										{
											className: "Terrasoft.MenuItem",
											caption: resources.localizableStrings.UnGroupMenuItemCaption,
											click: {
												bindTo: "unGroupItems"
											},
											enabled: {
												bindTo: "unGroupButtonVisible"
											}
										},
										{
											className: "Terrasoft.MenuItem",
											caption: resources.localizableStrings.MoveUpMenuItemCaption,
											click: {
												bindTo: "moveUp"
											},
											enabled: {
												bindTo: "moveUpButtonVisible"
											}
										},
										{
											className: "Terrasoft.MenuItem",
											caption: resources.localizableStrings.MoveDownMenuItemCaption,
											click: {
												bindTo: "moveDown"
											},
											enabled: {
												bindTo: "moveDownButtonVisible"
											}
										}
									]
								}
							}
						]
					},
					{
						className: "Terrasoft.FilterEdit",
						renderTo: Ext.get("filteredit"),
						filterManager: {
							bindTo: "FilterManager"
						},
						selectedItems: {
							bindTo: "SelectedFilters"
						},
						selectedFiltersChange: {
							bindTo: "onSelectedFilterChange"
						}
					}
				]
			};
			return view;
		}

		return {
			generateView: generateView
		};
	});