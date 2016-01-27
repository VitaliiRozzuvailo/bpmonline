define("SearchDuplicatesSettingsPageView", ["ext-base", "terrasoft", "SearchDuplicatesSettingsPageViewResources"],
	function(Ext, Terrasoft, resources) {

		function generate() {
			var viewConfig = {
				id: "searchDuplicatesSettingsContainer",
				selectors: {
					wrapEl: "#searchDuplicatesSettingsContainer"
				},
				items: [ {
					className: "Terrasoft.Container",
					id: "buttonsContainer",
					selectors: {
						wrapEl: "#buttonsContainer"
					},
					items: [{
						className: "Terrasoft.Button",
						id: "acceptButton",
						caption: resources.localizableStrings.OkButtonCaption,
						style: Terrasoft.controls.ButtonEnums.style.GREEN,
						tag: "AcceptButton",
						click: {
							bindTo: "okClick"
						}
					}, {
						className: "Terrasoft.Button",
						caption: resources.localizableStrings.CancelButtonCaption,
						tag: "CancelButton",
						click: {
							bindTo: "cancelClick"
						}
					}]
				}, {
					className: "Terrasoft.ControlGroup",
					id: "onSaveSettingsControlGroup",
					selectors: {
						wrapEl: "#onSaveSettingsControlGroup"
					},
					collapsed: false,
					caption: resources.localizableStrings.OnSaveSettingsGroupCaption,
					items: [{
						className: "Terrasoft.Container",
						id: "onSaveSettingsCheckboxContainer",
						selectors: {
							wrapEl: "#onSaveSettingsCheckboxContainer"
						},
						classes: {
							wrapClassName: ["custom-inline"]
						},
						items: [{
							className: "Terrasoft.CheckBoxEdit",
							tag: "onSaveSearch",
							checked: {
								bindTo: "isOnSaveSearch"
							}
						}, {
							className: "Terrasoft.Label",
							caption: {
								bindTo: "getOnSaveSettingsTitle"
							}
						}]
					}]
				}, {
					className: "Terrasoft.ControlGroup",
					id: "byPeriodSettingsControlGroup",
					selectors: {
						wrapEl: "#byPeriodSettingsControlGroup"
					},
					collapsed: false,
					caption: resources.localizableStrings.ByPeriodSettingsGroupCaption,
					items: [{
						className: "Terrasoft.Container",
						id: "byPeriodSettingsControlContainer",
						selectors: {
							wrapEl: "#byPeriodSettingsControlContainer"
						},
						classes: {
							wrapClassName: ["custom-inline"]
						},
						items: [{
							className: "Terrasoft.CheckBoxEdit",
							tag: "byPeriodSearch",
							checked: {
								bindTo: "isByPeriodSearch"
							}
						}, {
							className: "Terrasoft.Label",
							caption: resources.localizableStrings.ByPeriodSettingsTitleCaption
						}]
					}, {
						className: "Terrasoft.Container",
						id: "byPeriodSettingsForChangedContainer",
						selectors: {
							wrapEl: "#byPeriodSettingsForChangedContainer"
						},
						classes: {
							wrapClassName: ["custom-inline"]
						},
						items: [{
							className: "Terrasoft.RadioButton",
							tag: "Changed",
							enabled: {
								bindTo: "isByPeriodSearch"
							},
							checked: {
								bindTo: "isByPeriodGroup"
							}
						}, {
							className: "Terrasoft.Label",
							caption: {
								bindTo: "getByPeriodChangedTitle"
							}
						}]
					}, {
						className: "Terrasoft.Container",
						id: "byPeriodSettingsForAllContainer",
						selectors: {
							wrapEl: "#byPeriodSettingsForAllContainer"
						},
						items: [{
							className: "Terrasoft.Container",
							id: "byPeriodSettingsForAllRadioContainer",
							selectors: {
								wrapEl: "#byPeriodSettingsForAllRadioContainer"
							},
							classes: {
								wrapClassName: ["custom-inline"]
							},
							items: [{
								className: "Terrasoft.RadioButton",
								tag: "All",
								enabled: {
									bindTo: "isByPeriodSearch"
								},
								checked: {
									bindTo: "isByPeriodGroup"
								}
							}, {
								className: "Terrasoft.Label",
								caption: {
									bindTo: "getByPeriodAllTitle"
								}
							}]
						}, {
							className: "Terrasoft.Container",
							id: "byPeriodSettingsOnTimeContainer",
							selectors: {
								wrapEl: "#byPeriodSettingsOnTimeContainer"
							},
							items: [{
								className: "Terrasoft.Label",
								caption: resources.localizableStrings.DateFromCaption
							}, {
								className: "Terrasoft.TimeEdit",
								value: {
									bindTo: "onTime"
								},
								enabled: {
									bindTo: "isByPeriodSearchEnabled"
								}
							}, {
								className: "Terrasoft.Label",
								caption: resources.localizableStrings.WeekCaption
							}]
						}, {
							className: "Terrasoft.Container",
							id: "byPeriodSettingsWeekContainer",
							selectors: {
								wrapEl: "#byPeriodSettingsWeekContainer"
							},
							items: [{
								className: "Terrasoft.Container",
								id: "byPeriodSettingsWeekLeftContainer",
								selectors: {
									wrapEl: "#byPeriodSettingsWeekLeftContainer"
								},
								classes: {
									wrapClassName: ["custom-inline"]
								},
								items: [{
									className: "Terrasoft.Container",
									id: "byPeriodSettingsIsMondayContainer",
									selectors: {
										wrapEl: "#byPeriodSettingsIsMondayContainer"
									},
									items: [{
										className: "Terrasoft.CheckBoxEdit",
										tag: "isMonday",
										checked: {
											bindTo: "isMonday"
										},
										enabled: {
											bindTo: "isByPeriodSearchEnabled"
										}
									}, {
										className: "Terrasoft.Label",
										caption: resources.localizableStrings.MondayCaption
									}]
								}, {
									className: "Terrasoft.Container",
									id: "byPeriodSettingsIsTuesdayContainer",
									selectors: {
										wrapEl: "#byPeriodSettingsIsTuesdayContainer"
									},
									items: [{
										className: "Terrasoft.CheckBoxEdit",
										tag: "isTuesday",
										checked: {
											bindTo: "isTuesday"
										},
										enabled: {
											bindTo: "isByPeriodSearchEnabled"
										}
									}, {
										className: "Terrasoft.Label",
										caption: resources.localizableStrings.TuesdayCaption
									}]
								}, {
									className: "Terrasoft.Container",
									id: "byPeriodSettingsIsWednesdayContainer",
									selectors: {
										wrapEl: "#byPeriodSettingsIsWednesdayContainer"
									},
									items: [{
										className: "Terrasoft.CheckBoxEdit",
										tag: "isWednesday",
										checked: {
											bindTo: "isWednesday"
										},
										enabled: {
											bindTo: "isByPeriodSearchEnabled"
										}
									}, {
										className: "Terrasoft.Label",
										caption: resources.localizableStrings.WednesdayCaption
									}]
								}, {
									className: "Terrasoft.Container",
									id: "byPeriodSettingsIsThursdayContainer",
									selectors: {
										wrapEl: "#byPeriodSettingsIsThursdayContainer"
									},
									items: [{
										className: "Terrasoft.CheckBoxEdit",
										tag: "isThursday",
										checked: {
											bindTo: "isThursday"
										},
										enabled: {
											bindTo: "isByPeriodSearchEnabled"
										}
									}, {
										className: "Terrasoft.Label",
										caption: resources.localizableStrings.ThursdayCaption
									}]
								}]
							}, {
								className: "Terrasoft.Container",
								id: "byPeriodSettingsWeekRightContainer",
								selectors: {
									wrapEl: "#byPeriodSettingsWeekRightContainer"
								},
								classes: {
									wrapClassName: ["custom-inline"]
								},
								items: [{
									className: "Terrasoft.Container",
									id: "byPeriodSettingsIsFridayContainer",
									selectors: {
										wrapEl: "#byPeriodSettingsIsFridayContainer"
									},
									items: [{
										className: "Terrasoft.CheckBoxEdit",
										tag: "isFriday",
										checked: {
											bindTo: "isFriday"
										},
										enabled: {
											bindTo: "isByPeriodSearchEnabled"
										}
									}, {
										className: "Terrasoft.Label",
										caption: resources.localizableStrings.FridayCaption
									}]
								}, {
									className: "Terrasoft.Container",
									id: "byPeriodSettingsIsSaturdayContainer",
									selectors: {
										wrapEl: "#byPeriodSettingsIsSaturdayContainer"
									},
									items: [{
										className: "Terrasoft.CheckBoxEdit",
										tag: "isSaturday",
										checked: {
											bindTo: "isSaturday"
										},
										enabled: {
											bindTo: "isByPeriodSearchEnabled"
										}
									}, {
										className: "Terrasoft.Label",
										caption: resources.localizableStrings.SaturdayCaption
									}]
								}, {
									className: "Terrasoft.Container",
									id: "byPeriodSettingsIsSundayContainer",
									selectors: {
										wrapEl: "#byPeriodSettingsIsSundayContainer"
									},
									items: [{
										className: "Terrasoft.CheckBoxEdit",
										tag: "isSunday",
										checked: {
											bindTo: "isSunday"
										},
										enabled: {
											bindTo: "isByPeriodSearchEnabled"
										}
									}, {
										className: "Terrasoft.Label",
										caption: resources.localizableStrings.SundayCaption
									}]
								}]
							}]
						}]
					}]
				}]
			};
			return viewConfig;
		}

		return {
			generate: generate
		};
	});