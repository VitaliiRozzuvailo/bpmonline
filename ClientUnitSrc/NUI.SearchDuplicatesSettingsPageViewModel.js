define("SearchDuplicatesSettingsPageViewModel", ["ext-base", "terrasoft", "sandbox",
	"SearchDuplicatesSettingsPageViewModelResources", "ServiceHelper"],
	function(Ext, Terrasoft, sandbox, resources, ServiceHelper) {
	var entitySchemaName;
	function generate(parentSandbox, name) {
		entitySchemaName = name;
		sandbox = parentSandbox;
		var viewModelConfig = {
			columns: {
				onTime: {
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					dataValueType: Terrasoft.DataValueType.TIME,
					caption: "",
					name: "onTime"
				}
			},
			values: {
				isOnSaveSearch: true,
				isByPeriodSearch: true,
				onTime: "",
				isByPeriodChanged: false,
				isByPeriodAll: false,
				isByPeriodGroup: "",
				isMonday: false,
				isTuesday: false,
				isWednesday: false,
				isThursday: false,
				isFriday: false,
				isSaturday: false,
				isSunday: false
			},
			methods: {
				load: load,
				okClick: okClick,
				cancelClick: cancelClick,
				getHeader: getHeader,
				getOnSaveSettingsTitle: getOnSaveSettingsTitle,
				getByPeriodChangedTitle: getByPeriodChangedTitle,
				getByPeriodAllTitle: getByPeriodAllTitle,
				isByPeriodSearchEnabled: isByPeriodSearchEnabled
			}
		};
		return viewModelConfig;
	}

	function load() {
		var esq = Ext.create("Terrasoft.EntitySchemaQuery", {
			rootSchemaName: "DuplicatesSearchParameter"
		});
		esq.addColumn("Id");
		esq.addColumn("PerformSearchOnSave");
		esq.addColumn("PerformSheduledSearch");
		esq.addColumn("SearchTime");
		esq.addColumn("SearchByModifiedOnly");
		esq.addColumn("SearchByAll");
		esq.addColumn("Days");
		esq.filters.addItem(Terrasoft.createColumnFilterWithParameter(
			Terrasoft.ComparisonType.EQUAL,	"SchemaToSearchName", entitySchemaName));
		esq.getEntityCollection(function(response) {
			if (response.success) {
				var settings = response.collection.getItems()[0].values;
				this.set("isOnSaveSearch", settings.PerformSearchOnSave);
				this.set("isByPeriodSearch", settings.PerformSheduledSearch);
				this.set("onTime", settings.SearchTime);
				this.set("isByPeriodChanged", settings.SearchByModifiedOnly);
				this.set("isByPeriodAll", settings.SearchByAll);
				if (settings.SearchByAll) {
					this.set("isByPeriodGroup", "All");
				} else {
					this.set("isByPeriodGroup", "Changed");
				}
				var days = ["isMonday", "isTuesday", "isWednesday", "isThursday",
					"isFriday", "isSaturday", "isSunday"];
				var daysBin = "00000000" + parseInt(settings.Days, 0).toString(2).substr(0, 8);
				daysBin = daysBin.substr(daysBin.length - 8, 8);
				var daysBinLength = daysBin.length - 1;
				for (var i = 0; i < daysBinLength; i++) {
					var bit = parseInt(daysBin.substr(i, 1), 0);
					this.set(days[daysBinLength - i - 1], bit === 1);
				}
			}
		}, this);
	}

	function okClick() {
		var update = Ext.create("Terrasoft.UpdateQuery", {
			rootSchemaName: "DuplicatesSearchParameter"
		});
		update.filters.addItem(Terrasoft.createColumnFilterWithParameter(
			Terrasoft.ComparisonType.EQUAL,	"SchemaToSearchName", entitySchemaName));
		update.setParameterValue("PerformSearchOnSave", this.get("isOnSaveSearch"),
			Terrasoft.DataValueType.BOOLEAN);
		update.setParameterValue("PerformSheduledSearch", this.get("isByPeriodSearch"),
			Terrasoft.DataValueType.BOOLEAN);
		update.setParameterValue("SearchTime", this.get("onTime"),
			Terrasoft.DataValueType.TIME);
		update.setParameterValue("SearchByModifiedOnly", this.get("isByPeriodChanged"),
			Terrasoft.DataValueType.BOOLEAN);
		update.setParameterValue("SearchByAll", this.get("isByPeriodAll"),
			Terrasoft.DataValueType.BOOLEAN);

		var isMonday = this.get("isMonday") ? 1 : 0;
		var isTuesday = this.get("isTuesday") ? 1 : 0;
		var isWednesday = this.get("isWednesday") ? 1 : 0;
		var isThursday = this.get("isThursday") ? 1 : 0;
		var isFriday = this.get("isFriday") ? 1 : 0;
		var isSaturday = this.get("isSaturday") ? 1 : 0;
		var isSunday = this.get("isSunday") ? 1 : 0;
		var daysBin = 0 << 0 | isMonday << 1 | isTuesday << 2 | isWednesday << 3 |
			isThursday << 4 | isFriday << 5 | isSaturday << 6 | isSunday << 7;
		this.set("daysBin", daysBin);
		update.setParameterValue("Days", daysBin, Terrasoft.DataValueType.INTEGER);
		update.execute(function(response) {
			if (response.success) {
				if (this.get("isByPeriodSearch") && this.get("isByPeriodAll") && this.get("daysBin") !== 0 && this.get("onTime")) {
					var daysBitMask = this.get("daysBin").toString(2);
					var daysOfWeek = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
					var selectedDays = "";
					for (var i = 0; i < 7; i++) {
						if (daysBitMask.substr(i, 1) === "1") {
							selectedDays += daysOfWeek[i] + ",";
						}
					}
					selectedDays = selectedDays.substring(0, selectedDays.length - 1);
					var dataSend = {
						timeSchedule: {
							SelectedDays: selectedDays,
							Hours: this.get("onTime").getUTCHours().toString(),
							Minutes: this.get("onTime").getUTCMinutes().toString()
						}
					};
					ServiceHelper.callService("SearchDuplicatesService", "Schedule" + entitySchemaName + "Search",
							function(responce) {}, dataSend, this);
				} else {
					if (!this.get("isByPeriodSearch") || this.get("daysBin") === 0 || !this.get("onTime")) {
						ServiceHelper.callService("SearchDuplicatesService", "Remove" + entitySchemaName + "Schedule",
								function(responce) {});
					}
				}
			}
			cancelClick();
		}, this);
	}

	function cancelClick() {
		sandbox.publish("BackHistoryState");
	}

	function getHeader() {
		return Ext.String.format(resources.localizableStrings.PageHeaderMask,
			resources.localizableStrings["PageHeader" + entitySchemaName]);
	}

	function getMainHeaderCaption(name) {
		return Ext.String.format(resources.localizableStrings.PageHeaderMask,
				resources.localizableStrings["PageHeader" + name]);
	}

	function getOnSaveSettingsTitle() {
		return Ext.String.format(resources.localizableStrings.SearchOnSaveMask,
			resources.localizableStrings["SearchOnSave" + entitySchemaName]);
	}

	function getByPeriodChangedTitle() {
		return Ext.String.format(resources.localizableStrings.ByPeriodChangeMask,
			resources.localizableStrings["ByPeriod" + entitySchemaName]);
	}

	function getByPeriodAllTitle() {
		return Ext.String.format(resources.localizableStrings.ByPeriodAllMask,
			resources.localizableStrings["ByPeriod" + entitySchemaName]);
	}

	function isByPeriodSearchEnabled() {
		return this.get("isByPeriodSearch") && this.get("isByPeriodAll");
	}

	return {
		generate: generate,
		getMainHeaderCaption: getMainHeaderCaption
	};
});