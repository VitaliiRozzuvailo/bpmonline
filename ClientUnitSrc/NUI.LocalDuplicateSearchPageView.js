define("LocalDuplicateSearchPageView", ["terrasoft", "LocalDuplicateSearchPageViewResources"], function(Terrasoft,
		resources) {
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
					name: {bindTo: "Name"}
				}]
			}, {
				cols: 6,
				key: [{
					name: resources.localizableStrings.GridTitleAccountPhone,
					type: "caption"
				}, {
					name: {bindTo: "Phone"}
				}]
			}, {
				cols: 6,
				key: [{
					name: resources.localizableStrings.GridTitleAccountAdditionalPhone,
					type: "caption"
				}, {
					name: {bindTo: "AdditionalPhone"}
				}]
			}, {
				cols: 6,
				key: [{
					name: resources.localizableStrings.GridTitleAccountWeb,
					type: "caption"
				}, {
					name: {bindTo: "Web"}
				}]
			}];
		} else {
			columnsConfig = [{
				cols: 6,
				key: [{
					name: resources.localizableStrings["GridTitle" + this.entitySchemaName],
					type: "caption"
				}, {
					name: {bindTo: "Name"}
				}]
			}, {
				cols: 6,
				key: [{
					name: resources.localizableStrings.GridTitleContactMobilePhone,
					type: "caption"
				}, {
					name: {bindTo: "MobilePhone"}
				}]
			}, {
				cols: 6,
				key: [{
					name: resources.localizableStrings.GridTitleContactHomePhone,
					type: "caption"
				}, {
					name: {bindTo: "HomePhone"}
				}]
			}, {
				cols: 6,
				key: [{
					name: resources.localizableStrings.GridTitleContactEmail,
					type: "caption"
				}, {
					name: {bindTo: "Email"}
				}]
			}];
		}

		return {
			id: "localDuplicateSearchContainer",
			selectors: {wrapEl: "#localDuplicateSearchContainer"},
			items: [
				{
					className: "Terrasoft.Container",
					id: "buttonsContainer",
					selectors: {wrapEl: "#buttonsContainer"},
					items: [
						{
							className: "Terrasoft.Button",
							id: "acceptButton",
							caption: resources.localizableStrings.OkButtonCaption,
							style: Terrasoft.controls.ButtonEnums.style.GREEN,
							tag: "AcceptButton",
							click: {bindTo: "okClick"}
						},
						{
							className: "Terrasoft.Button",
							caption: resources.localizableStrings.CancelButtonCaption,
							tag: "CancelButton",
							click: {bindTo: "cancelClick"}
						}
					]
				},
				{
					className: "Terrasoft.Container",
					id: "DescriptionContainer",
					selectors: {
						wrapEl: "#DescriptionContainer"
					},
					items: [
						{
							className: "Terrasoft.Label",
							caption: {
								bindTo: "DescriptionCaption"
							}
						}
					]
				},
				{
					id: "duplicateGrid",
					className: "Terrasoft.Grid",
					type: "tiled",
					primaryColumnName: "Id",
					activeRow: {bindTo: "activeRow"},
					columnsConfig: [columnsConfig],
					collection: {bindTo: "gridData"},
					activeRowAction: {bindTo: "onActiveRowAction"},
					activeRowActions: [
						{
							className: "Terrasoft.Button",
							style: Terrasoft.controls.ButtonEnums.style.BLUE,
							caption: resources.localizableStrings.IsNotDuplicateCaption,
							tag: "IsNotDuplicate",
							visible: {bindTo: "getGridButtonIsNotDuplicateVisible"}
						},
						{
							className: "Terrasoft.Button",
							style: Terrasoft.controls.ButtonEnums.style.BLUE,
							caption: resources.localizableStrings.IsDuplicateCaption,
							tag: "IsDuplicate",
							visible: {bindTo: "getGridButtonIsDuplicateVisible"}
						}
					]
				}
			]
		};
	}

	return {generate: generate};
});