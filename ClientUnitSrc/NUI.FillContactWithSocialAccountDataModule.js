define('FillContactWithSocialAccountDataModule', ['sandbox', 'ext-base', 'terrasoft', 'SocialAccountAuthUtilities', 'FillContactWithSocialAccountDataModuleResources'],
	function(sandbox, Ext, Terrasoft, SocialAccountAuthUtilities, resources) {

		var viewModel;
		var view;

		function getView() {
			var container = Ext.create('Terrasoft.Container', {
				id: 'main',
				selectors: {
					wrapEl: '#main'
				},
				classes: {
					wrapClassName: 'table-container'
				},
				items: [
					{
						className: 'Terrasoft.Container',
						id: 'topButtons',
						selectors: {
							wrapEl: '#topButtons'
						},
						classes: {
							wrapClassName: ['container-spacing']
						},
						items: [
							{
								className: 'Terrasoft.Button',
								style: Terrasoft.controls.ButtonEnums.style.GREEN,
								caption: resources.localizableStrings.OkButtonCaption,
								click: {
									bindTo: 'onOKButtonClick'
								}
							},
							{
								className: 'Terrasoft.Button',
								style: Terrasoft.controls.ButtonEnums.style.GRAY,
								caption: resources.localizableStrings.CancelButtonCaption,
								click: {
									bindTo: 'onCancelButtonClick'
								}
							}
						]
					},
					{
						className: 'Terrasoft.Label',
						classes: {
							labelClass: ['div-caption-label']
						},
						caption: resources.localizableStrings.ChooseOrFillValues,
						visible: true
					},
					{
						className: 'Terrasoft.Label',
						classes: {
							labelClass: ['labelEdit']
						},
						caption: resources.localizableStrings.NameCaption,
						visible: {
							bindTo: 'isNameContainerVisible'
						}
					},
					{
						className: 'Terrasoft.Container',
						id: 'nameContainer',
						classes: {
							wrapClassName: [
								'container-spacing',
								'table-row'
							]
						},
						selectors: {
							wrapEl: '#nameContainer'
						},
						visible: {
							bindTo: 'isNameContainerVisible'
						},
						items: [
							{
								className: 'Terrasoft.Container',
								id: 'leftnameContainer',
								classes: {
									wrapClassName: [
										'left-container',
										'table-cell'
									]
								},
								selectors: {
									wrapEl: '#leftnameContainer'
								},
								items: [
									{
										className: 'Terrasoft.TextEdit',
										value: {
											bindTo: 'resultName'
										}
									}
								]
							},
							{
								className: 'Terrasoft.Container',
								id: 'rightnameContainer',
								classes: {
									wrapClassName: [
										'right-container',
										'table-cell'
									]
								},
								selectors: {
									wrapEl: '#rightnameContainer'
								},
								items: [
									{
										className: 'Terrasoft.ControlGroup',
										id: 'nameControlGroup',
										selectors: {
											wrapEl: '#nameControlGroup'
										},
										collapsed: true,
										caption: resources.localizableStrings.NameCaption,
										items: [
											{
												className: 'Terrasoft.Label',
												classes: {
													labelClass: ['labelEdit']
												},
												caption: resources.localizableStrings.CurrentValueCaption,
												visible: true
											},
											{
												className: 'Terrasoft.Container',
												id: 'initNameContainer',
												selectors: {
													wrapEl: '#initNameContainer'
												},
												classes: {
													wrapClassName: ['container-spacing']
												},
												items: [
													{
														className: 'Terrasoft.Container',
														id: 'init-name-radiobutton',
														selectors: {
															wrapEl: '#init-name-radiobutton'
														},
														classes: {
															wrapClassName: ['radiobutton-left']
														},
														items: [
															{
																className: 'Terrasoft.RadioButton',
																tag: 'initName',
																checked: {
																	bindTo: 'defNameTag'
																}
															}
														]
													},
													{
														className: 'Terrasoft.Container',
														id: 'init-name-textedit',
														selectors: {
															wrapEl: '#init-name-textedit'
														},
														classes: {
															wrapClassName: ['textedit-right']
														},
														items: [
															{
																className: 'Terrasoft.TextEdit',
																value: {
																	bindTo: 'initName'
																},
																enabled: false
															}
														]
													}
												]
											},
											{
												className: 'Terrasoft.Label',
												classes: {
													labelClass: ['labelEdit']
												},
												caption: resources.localizableStrings.FacebookValueCaption,
												visible: {
													bindTo: 'FacebookName',
													bindConfig: {
														converter: function(value) {
															return value != '';
														}
													}
												}
											},
											{
												className: 'Terrasoft.Container',
												id: 'facebookNameContainer',
												selectors: {
													wrapEl: '#facebookNameContainer'
												},
												classes: {
													wrapClassName: ['container-spacing']
												},
												items: [
													{
														className: 'Terrasoft.Container',
														id: 'facebook-name-radiobutton',
														selectors: {
															wrapEl: '#facebook-name-radiobutton'
														},
														classes: {
															wrapClassName: ['radiobutton-left']
														},
														items: [
															{
																className: 'Terrasoft.RadioButton',
																tag: 'FacebookName',
																checked: {
																	bindTo: 'defNameTag'
																},
																visible: {
																	bindTo: 'FacebookName',
																	bindConfig: {
																		converter: function(value) {
																			return value != '';
																		}
																	}
																}
															}
														]
													},
													{
														className: 'Terrasoft.Container',
														id: 'facebook-name-textedit',
														selectors: {
															wrapEl: '#facebook-name-textedit'
														},
														classes: {
															wrapClassName: ['textedit-right']
														},
														items: [
															{
																className: 'Terrasoft.TextEdit',
																value: {
																	bindTo: 'FacebookName'
																},
																visible: {
																	bindTo: 'FacebookName',
																	bindConfig: {
																		converter: function(value) {
																			return value != '';
																		}
																	}
																}
															}
														]
													}
												]
											},
											/**
											 * Блок, отвечающий за интеграцию с LinkedIn
											 */
//											{
//												className: 'Terrasoft.Label',
//												classes: {
//													labelClass: ['labelEdit']
//												},
//												caption: resources.localizableStrings.LinkedInValueCaption,
//												visible: {
//													bindTo: 'LinkedInName',
//													bindConfig: {
//														converter: function(value) {
//															return value != '';
//														}
//													}
//												}
//											},
											/**
											* Блок, отвечающий за интеграцию с LinkedIn
											*/
//											{
//												className: 'Terrasoft.Container',
//												id: 'linkedInNameContainer',
//												selectors: {
//													wrapEl: '#linkedInNameContainer'
//												},
//												classes: {
//													wrapClassName: ['container-spacing']
//												},
//												items: [
//													{
//														className: 'Terrasoft.Container',
//														id: 'linkedIn-name-radiobutton',
//														selectors: {
//															wrapEl: '#linkedIn-name-radiobutton'
//														},
//														classes: {
//															wrapClassName: ['radiobutton-left']
//														},
//														items: [
//															{
//																className: 'Terrasoft.RadioButton',
//																tag: 'LinkedInName',
//																checked: {
//																	bindTo: 'defNameTag'
//																},
//																visible: {
//																	bindTo: 'LinkedInName',
//																	bindConfig: {
//																		converter: function(value) {
//																			return value != '';
//																		}
//																	}
//																}
//															}
//														]
//													},
//													{
//														className: 'Terrasoft.Container',
//														id: 'linkedIn-name-textedit',
//														selectors: {
//															wrapEl: '#linkedIn-name-textedit'
//														},
//														classes: {
//															wrapClassName: ['textedit-right']
//														},
//														items: [
//															{
//																className: 'Terrasoft.TextEdit',
//																value: {
//																	bindTo: 'LinkedInName'
//																},
//																visible: {
//																	bindTo: 'LinkedInName',
//																	bindConfig: {
//																		converter: function(value) {
//																			return value != '';
//																		}
//																	}
//																},
//																enabled: false
//															}
//														]
//													}
//												]
//											},
											{
												className: 'Terrasoft.Label',
												classes: {
													labelClass: ['labelEdit']
												},
												caption: resources.localizableStrings.TwitterValueCaption,
												visible: {
													bindTo: 'TwitterName',
													bindConfig: {
														converter: function(value) {
															return value != '';
														}
													}
												}
											},
											{
												className: 'Terrasoft.Container',
												id: 'twitterNameContainer',
												selectors: {
													wrapEl: '#twitterNameContainer'
												},
												classes: {
													wrapClassName: ['container-spacing']
												},
												items: [
													{
														className: 'Terrasoft.Container',
														id: 'twitter-name-radiobutton',
														selectors: {
															wrapEl: '#twitter-name-radiobutton'
														},
														classes: {
															wrapClassName: ['radiobutton-left']
														},
														items: [
															{
																className: 'Terrasoft.RadioButton',
																tag: 'TwitterName',
																checked: {
																	bindTo: 'defNameTag'
																},
																visible: {
																	bindTo: 'TwitterName',
																	bindConfig: {
																		converter: function(value) {
																			return value != '';
																		}
																	}
																}
															}
														]
													},
													{
														className: 'Terrasoft.Container',
														id: 'twitter-name-textedit',
														selectors: {
															wrapEl: '#twitter-name-textedit'
														},
														classes: {
															wrapClassName: ['textedit-right']
														},
														items: [
															{
																className: 'Terrasoft.TextEdit',
																value: {
																	bindTo: 'TwitterName'
																},
																visible: {
																	bindTo: 'TwitterName',
																	bindConfig: {
																		converter: function(value) {
																			return value != '';
																		}
																	}
																},
																enabled: false
															}
														]
													}
												]
											}
										]
									}
								]
							}
						]
					},
					{
						className: 'Terrasoft.Label',
						classes: {
							labelClass: ['labelEdit']
						},
						caption: resources.localizableStrings.EmailCaption,
						visible: {
							bindTo: 'isEmailContainerVisible'
						}
					},
					{
						className: 'Terrasoft.Container',
						id: 'emailContainer',
						classes: {
							wrapClassName: [
								'container-spacing',
								'table-row'
							]
						},
						selectors: {
							wrapEl: '#emailContainer'
						},
						visible: {
							bindTo: 'isEmailContainerVisible'
						},
						items: [
							{
								className: 'Terrasoft.Container',
								id: 'leftemailContainer',
								classes: {
									wrapClassName: [
										'left-container',
										'table-cell'
									]
								},
								selectors: {
									wrapEl: '#leftemailContainer'
								},
								items: [
									{
										className: 'Terrasoft.TextEdit',
										value: {
											bindTo: 'resultEmail'
										}
									}
								]
							},
							{
								className: 'Terrasoft.Container',
								id: 'rightemailContainer',
								classes: {
									wrapClassName: [
										'right-container',
										'table-cell'
									]
								},
								selectors: {
									wrapEl: '#rightemailContainer'
								},
								items: [
									{
										className: 'Terrasoft.ControlGroup',
										id: 'emailControlGroup',
										selectors: {
											wrapEl: '#emailControlGroup'
										},
										collapsed: true,
										caption: resources.localizableStrings.EmailCaption,
										items: [
											{
												className: 'Terrasoft.Label',
												classes: {
													labelClass: ['labelEdit']
												},
												caption: resources.localizableStrings.CurrentValueCaption,
												visible: true
											},
											{
												className: 'Terrasoft.Container',
												id: 'initEmailContainer',
												selectors: {
													wrapEl: '#initEmailContainer'
												},
												classes: {
													wrapClassName: ['container-spacing']
												},
												items: [
													{
														className: 'Terrasoft.Container',
														id: 'init-email-radiobutton',
														selectors: {
															wrapEl: '#init-email-radiobutton'
														},
														classes: {
															wrapClassName: ['radiobutton-left']
														},
														items: [
															{
																className: 'Terrasoft.RadioButton',
																tag: 'initEmail',
																checked: {
																	bindTo: 'defEmailTag'
																}
															}
														]
													},
													{
														className: 'Terrasoft.Container',
														id: 'init-email-textedit',
														selectors: {
															wrapEl: '#init-email-textedit'
														},
														classes: {
															wrapClassName: ['textedit-right']
														},
														items: [
															{
																className: 'Terrasoft.TextEdit',
																value: {
																	bindTo: 'initEmail'
																},
																enabled: false
															}
														]
													}
												]
											},
											{
												className: 'Terrasoft.Label',
												classes: {
													labelClass: ['labelEdit']
												},
												caption: resources.localizableStrings.FacebookValueCaption,
												visible: {
													bindTo: 'FacebookEmail',
													bindConfig: {
														converter: function(value) {
															return value != '';
														}
													}
												}
											},
											{
												className: 'Terrasoft.Container',
												id: 'facebookEmailContainer',
												selectors: {
													wrapEl: '#facebookEmailContainer'
												},
												classes: {
													wrapClassName: ['container-spacing']
												},
												items: [
													{
														className: 'Terrasoft.Container',
														id: 'facebook-email-radiobutton',
														selectors: {
															wrapEl: '#facebook-email-radiobutton'
														},
														classes: {
															wrapClassName: ['radiobutton-left']
														},
														items: [
															{
																className: 'Terrasoft.RadioButton',
																tag: 'FacebookEmail',
																checked: {
																	bindTo: 'defEmailTag'
																},
																visible: {
																	bindTo: 'FacebookEmail',
																	bindConfig: {
																		converter: function(value) {
																			return value != '';
																		}
																	}
																}
															}
														]
													},
													{
														className: 'Terrasoft.Container',
														id: 'facebook-email-textedit',
														selectors: {
															wrapEl: '#facebook-email-textedit'
														},
														classes: {
															wrapClassName: ['textedit-right']
														},
														items: [
															{
																className: 'Terrasoft.TextEdit',
																value: {
																	bindTo: 'FacebookEmail'
																},
																visible: {
																	bindTo: 'FacebookEmail',
																	bindConfig: {
																		converter: function(value) {
																			return value != '';
																		}
																	}
																},
																enabled: false
															}
														]
													}
												]
											},
											/**
											* Блок, отвечающий за интеграцию с LinkedIn
											*/
//											{
//												className: 'Terrasoft.Label',
//												classes: {
//													labelClass: ['labelEdit']
//												},
//												caption: resources.localizableStrings.LinkedInValueCaption,
//												visible: {
//													bindTo: 'LinkedInEmail',
//													bindConfig: {
//														converter: function(value) {
//															return value != '';
//														}
//													}
//												}
//											},
											/**
											* Блок, отвечающий за интеграцию с LinkedIn
											*/
//											{
//												className: 'Terrasoft.Container',
//												id: 'linkedInEmailContainer',
//												selectors: {
//													wrapEl: '#linkedInEmailContainer'
//												},
//												classes: {
//													wrapClassName: ['container-spacing']
//												},
//												items: [
//													{
//														className: 'Terrasoft.Container',
//														id: 'linkedIn-email-radiobutton',
//														selectors: {
//															wrapEl: '#linkedIn-email-radiobutton'
//														},
//														classes: {
//															wrapClassName: ['radiobutton-left']
//														},
//														items: [
//															{
//																className: 'Terrasoft.RadioButton',
//																tag: 'LinkedInEmail',
//																checked: {
//																	bindTo: 'defEmailTag'
//																},
//																visible: {
//																	bindTo: 'LinkedInEmail',
//																	bindConfig: {
//																		converter: function(value) {
//																			return value != '';
//																		}
//																	}
//																}
//															}
//														]
//													},
//													{
//														className: 'Terrasoft.Container',
//														id: 'linkedIn-email-textedit',
//														selectors: {
//															wrapEl: '#linkedIn-email-textedit'
//														},
//														classes: {
//															wrapClassName: ['textedit-right']
//														},
//														items: [
//															{
//																className: 'Terrasoft.TextEdit',
//																value: {
//																	bindTo: 'LinkedInEmail'
//																},
//																visible: {
//																	bindTo: 'LinkedInEmail',
//																	bindConfig: {
//																		converter: function(value) {
//																			return value != '';
//																		}
//																	}
//																},
//																enabled: false
//															}
//														]
//													}
//												]
//											},
											{
												className: 'Terrasoft.Label',
												classes: {
													labelClass: ['labelEdit']
												},
												caption: resources.localizableStrings.TwitterValueCaption,
												visible: {
													bindTo: 'TwitterEmail',
													bindConfig: {
														converter: function(value) {
															return value != '';
														}
													}
												}
											},
											{
												className: 'Terrasoft.Container',
												id: 'twitterEmailContainer',
												selectors: {
													wrapEl: '#twitterEmailContainer'
												},
												classes: {
													wrapClassName: ['container-spacing']
												},
												items: [
													{
														className: 'Terrasoft.Container',
														id: 'twitter-email-radiobutton',
														selectors: {
															wrapEl: '#twitter-email-radiobutton'
														},
														classes: {
															wrapClassName: ['radiobutton-left']
														},
														items: [
															{
																className: 'Terrasoft.RadioButton',
																tag: 'TwitterEmail',
																checked: {
																	bindTo: 'defEmailTag'
																},
																visible: {
																	bindTo: 'TwitterEmail',
																	bindConfig: {
																		converter: function(value) {
																			return value != '';
																		}
																	}
																}
															}
														]
													},
													{
														className: 'Terrasoft.Container',
														id: 'twitter-email-textedit',
														selectors: {
															wrapEl: '#twitter-email-textedit'
														},
														classes: {
															wrapClassName: ['textedit-right']
														},
														items: [
															{
																className: 'Terrasoft.TextEdit',
																value: {
																	bindTo: 'TwitterEmail'
																},
																visible: {
																	bindTo: 'TwitterEmail',
																	bindConfig: {
																		converter: function(value) {
																			return value != '';
																		}
																	}
																},
																enabled: false
															}
														]
													}
												]
											}
										]
									}
								]
							}
						]
					},
					{
						className: 'Terrasoft.Label',
						classes: {
							labelClass: ['labelEdit']
						},
						caption: resources.localizableStrings.PhoneCaption,
						visible: {
							bindTo: 'isPhoneContainerVisible'
						}
					},
					{
						className: 'Terrasoft.Container',
						id: 'phoneContainer',
						classes: {
							wrapClassName: [
								'container-spacing',
								'table-row'
							]
						},
						selectors: {
							wrapEl: '#phoneContainer'
						},
						visible: {
							bindTo: 'isPhoneContainerVisible'
						},
						items: [
							{
								className: 'Terrasoft.Container',
								id: 'leftphoneContainer',
								classes: {
									wrapClassName: [
										'left-container',
										'table-cell'
									]
								},
								selectors: {
									wrapEl: '#leftphoneContainer'
								},
								items: [
									{
										className: 'Terrasoft.TextEdit',
										value: {
											bindTo: 'resultPhone'
										}
									}
								]
							},
							{
								className: 'Terrasoft.Container',
								id: 'rightphoneContainer',
								classes: {
									wrapClassName: [
										'right-container',
										'table-cell'
									]
								},
								selectors: {
									wrapEl: '#rightphoneContainer'
								},
								items: [
									{
										className: 'Terrasoft.ControlGroup',
										id: 'phoneControlGroup',
										selectors: {
											wrapEl: '#phoneControlGroup'
										},
										collapsed: true,
										caption: resources.localizableStrings.PhoneCaption,
										items: [
											{
												className: 'Terrasoft.Label',
												classes: {
													labelClass: ['labelEdit']
												},
												caption: resources.localizableStrings.CurrentValueCaption,
												visible: true
											},
											{
												className: 'Terrasoft.Container',
												id: 'initPhoneContainer',
												selectors: {
													wrapEl: '#initPhoneContainer'
												},
												classes: {
													wrapClassName: ['container-spacing']
												},
												items: [
													{
														className: 'Terrasoft.Container',
														id: 'init-phone-radiobutton',
														selectors: {
															wrapEl: '#init-phone-radiobutton'
														},
														classes: {
															wrapClassName: ['radiobutton-left']
														},
														items: [
															{
																className: 'Terrasoft.RadioButton',
																tag: 'initPhone',
																checked: {
																	bindTo: 'defPhoneTag'
																}
															}
														]
													},
													{
														className: 'Terrasoft.Container',
														id: 'init-phone-textedit',
														selectors: {
															wrapEl: '#init-phone-textedit'
														},
														classes: {
															wrapClassName: ['textedit-right']
														},
														items: [
															{
																className: 'Terrasoft.TextEdit',
																value: {
																	bindTo: 'initPhone'
																},
																enabled: false
															}
														]
													}
												]
											},
											{
												className: 'Terrasoft.Label',
												classes: {
													labelClass: ['labelEdit']
												},
												caption: resources.localizableStrings.FacebookValueCaption,
												visible: {
													bindTo: 'FacebookPhone',
													bindConfig: {
														converter: function(value) {
															return value != '';
														}
													}
												}
											},
											{
												className: 'Terrasoft.Container',
												id: 'facebookPhoneContainer',
												selectors: {
													wrapEl: '#facebookPhoneContainer'
												},
												classes: {
													wrapClassName: ['container-spacing']
												},
												items: [
													{
														className: 'Terrasoft.Container',
														id: 'facebook-phone-radiobutton',
														selectors: {
															wrapEl: '#facebook-phone-radiobutton'
														},
														classes: {
															wrapClassName: ['radiobutton-left']
														},
														items: [
															{
																className: 'Terrasoft.RadioButton',
																tag: 'FacebookPhone',
																checked: {
																	bindTo: 'defPhoneTag'
																},
																visible: {
																	bindTo: 'FacebookPhone',
																	bindConfig: {
																		converter: function(value) {
																			return value != '';
																		}
																	}
																}
															}
														]
													},
													{
														className: 'Terrasoft.Container',
														id: 'facebook-phone-textedit',
														selectors: {
															wrapEl: '#facebook-phone-textedit'
														},
														classes: {
															wrapClassName: ['textedit-right']
														},
														items: [
															{
																className: 'Terrasoft.TextEdit',
																value: {
																	bindTo: 'FacebookPhone'
																},
																visible: {
																	bindTo: 'FacebookPhone',
																	bindConfig: {
																		converter: function(value) {
																			return value != '';
																		}
																	}
																},
																enabled: false
															}
														]
													}
												]
											},
											/**
											* Блок, отвечающий за интеграцию с LinkedIn
											*/
//											{
//												className: 'Terrasoft.Label',
//												classes: {
//													labelClass: ['labelEdit']
//												},
//												caption: resources.localizableStrings.LinkedInValueCaption,
//												visible: {
//													bindTo: 'LinkedInPhone',
//													bindConfig: {
//														converter: function(value) {
//															return value != '';
//														}
//													}
//												}
//											},
											/**
											* Блок, отвечающий за интеграцию с LinkedIn
											*/
//											{
//												className: 'Terrasoft.Container',
//												id: 'linkedInPhoneContainer',
//												selectors: {
//													wrapEl: '#linkedInPhoneContainer'
//												},
//												classes: {
//													wrapClassName: ['container-spacing']
//												},
//												items: [
//													{
//														className: 'Terrasoft.Container',
//														id: 'linkedIn-phone-radiobutton',
//														selectors: {
//															wrapEl: '#linkedIn-phone-radiobutton'
//														},
//														classes: {
//															wrapClassName: ['radiobutton-left']
//														},
//														items: [
//															{
//																className: 'Terrasoft.RadioButton',
//																tag: 'LinkedInPhone',
//																checked: {
//																	bindTo: 'defPhoneTag'
//																},
//																visible: {
//																	bindTo: 'LinkedInPhone',
//																	bindConfig: {
//																		converter: function(value) {
//																			return value != '';
//																		}
//																	}
//																}
//															}
//														]
//													},
//													{
//														className: 'Terrasoft.Container',
//														id: 'linkedIn-phone-textedit',
//														selectors: {
//															wrapEl: '#linkedIn-phone-textedit'
//														},
//														classes: {
//															wrapClassName: ['textedit-right']
//														},
//														items: [
//															{
//																className: 'Terrasoft.TextEdit',
//																value: {
//																	bindTo: 'LinkedInPhone'
//																},
//																visible: {
//																	bindTo: 'LinkedInPhone',
//																	bindConfig: {
//																		converter: function(value) {
//																			return value != '';
//																		}
//																	}
//																},
//																enabled: false
//															}
//														]
//													}
//												]
//											},
											{
												className: 'Terrasoft.Label',
												classes: {
													labelClass: ['labelEdit']
												},
												caption: resources.localizableStrings.TwitterValueCaption,
												visible: {
													bindTo: 'TwitterPhone',
													bindConfig: {
														converter: function(value) {
															return value != '';
														}
													}
												}
											},
											{
												className: 'Terrasoft.Container',
												id: 'twitterPhoneContainer',
												selectors: {
													wrapEl: '#twitterPhoneContainer'
												},
												classes: {
													wrapClassName: ['container-spacing']
												},
												items: [
													{
														className: 'Terrasoft.Container',
														id: 'twitter-phone-radiobutton',
														selectors: {
															wrapEl: '#twitter-phone-radiobutton'
														},
														classes: {
															wrapClassName: ['radiobutton-left']
														},
														items: [
															{
																className: 'Terrasoft.RadioButton',
																tag: 'TwitterPhone',
																checked: {
																	bindTo: 'defPhoneTag'
																},
																visible: {
																	bindTo: 'TwitterPhone',
																	bindConfig: {
																		converter: function(value) {
																			return value != '';
																		}
																	}
																}
															}
														]
													},
													{
														className: 'Terrasoft.Container',
														id: 'twitter-phone-textedit',
														selectors: {
															wrapEl: '#twitter-phone-textedit'
														},
														classes: {
															wrapClassName: ['textedit-right']
														},
														items: [
															{
																className: 'Terrasoft.TextEdit',
																value: {
																	bindTo: 'TwitterPhone'
																},
																visible: {
																	bindTo: 'TwitterPhone',
																	bindConfig: {
																		converter: function(value) {
																			return value != '';
																		}
																	}
																},
																enabled: false
															}
														]
													}
												]
											}
										]
									}
								]
							}
						]
					},
					{
						className: 'Terrasoft.Label',
						classes: {
							labelClass: ['labelEdit']
						},
						caption: resources.localizableStrings.SkypeCaption,
						visible: {
							bindTo: 'isSkypeContainerVisible'
						}
					},
					{
						className: 'Terrasoft.Container',
						id: 'skypeContainer',
						classes: {
							wrapClassName: [
								'container-spacing',
								'table-row'
							]
						},
						selectors: {
							wrapEl: '#skypeContainer'
						},
						visible: {
							bindTo: 'isSkypeContainerVisible'
						},
						items: [
							{
								className: 'Terrasoft.Container',
								id: 'leftskypeContainer',
								classes: {
									wrapClassName: [
										'left-container',
										'table-cell'
									]
								},
								selectors: {
									wrapEl: '#leftskypeContainer'
								},
								items: [
									{
										className: 'Terrasoft.TextEdit',
										value: {
											bindTo: 'resultSkype'
										}
									}
								]
							},
							{
								className: 'Terrasoft.Container',
								id: 'rightskypeContainer',
								classes: {
									wrapClassName: [
										'right-container',
										'table-cell'
									]
								},
								selectors: {
									wrapEl: '#rightskypeContainer'
								},
								items: [
									{
										className: 'Terrasoft.ControlGroup',
										id: 'skypeControlGroup',
										selectors: {
											wrapEl: '#skypeControlGroup'
										},
										collapsed: true,
										caption: resources.localizableStrings.SkypeCaption,
										items: [
											{
												className: 'Terrasoft.Label',
												classes: {
													labelClass: ['labelEdit']
												},
												caption: resources.localizableStrings.CurrentValueCaption,
												visible: true
											},
											{
												className: 'Terrasoft.Container',
												id: 'initSkypeContainer',
												selectors: {
													wrapEl: '#initSkypeContainer'
												},
												classes: {
													wrapClassName: ['container-spacing']
												},
												items: [
													{
														className: 'Terrasoft.Container',
														id: 'init-skype-radiobutton',
														selectors: {
															wrapEl: '#init-skype-radiobutton'
														},
														classes: {
															wrapClassName: ['radiobutton-left']
														},
														items: [
															{
																className: 'Terrasoft.RadioButton',
																tag: 'initSkype',
																checked: {
																	bindTo: 'defSkypeTag'
																}
															}
														]
													},
													{
														className: 'Terrasoft.Container',
														id: 'init-skype-textedit',
														selectors: {
															wrapEl: '#init-skype-textedit'
														},
														classes: {
															wrapClassName: ['textedit-right']
														},
														items: [
															{
																className: 'Terrasoft.TextEdit',
																value: {
																	bindTo: 'initSkype'
																},
																enabled: false
															}
														]
													}
												]
											},
											{
												className: 'Terrasoft.Label',
												classes: {
													labelClass: ['labelEdit']
												},
												caption: resources.localizableStrings.FacebookValueCaption,
												visible: {
													bindTo: 'FacebookSkype',
													bindConfig: {
														converter: function(value) {
															return value != '';
														}
													}
												}
											},
											{
												className: 'Terrasoft.Container',
												id: 'facebookSkypeContainer',
												selectors: {
													wrapEl: '#facebookSkypeContainer'
												},
												classes: {
													wrapClassName: ['container-spacing']
												},
												items: [
													{
														className: 'Terrasoft.Container',
														id: 'facebook-skype-radiobutton',
														selectors: {
															wrapEl: '#facebook-skype-radiobutton'
														},
														classes: {
															wrapClassName: ['radiobutton-left']
														},
														items: [
															{
																className: 'Terrasoft.RadioButton',
																tag: 'FacebookSkype',
																checked: {
																	bindTo: 'defSkypeTag'
																},
																visible: {
																	bindTo: 'FacebookSkype',
																	bindConfig: {
																		converter: function(value) {
																			return value != '';
																		}
																	}
																}
															}
														]
													},
													{
														className: 'Terrasoft.Container',
														id: 'facebook-skype-textedit',
														selectors: {
															wrapEl: '#facebook-skype-textedit'
														},
														classes: {
															wrapClassName: ['textedit-right']
														},
														items: [
															{
																className: 'Terrasoft.TextEdit',
																value: {
																	bindTo: 'FacebookSkype'
																},
																visible: {
																	bindTo: 'FacebookSkype',
																	bindConfig: {
																		converter: function(value) {
																			return value != '';
																		}
																	}
																},
																enabled: false
															}
														]
													}
												]
											},
											/**
											* Блок, отвечающий за интеграцию с LinkedIn
											*/
//											{
//												className: 'Terrasoft.Label',
//												classes: {
//													labelClass: ['labelEdit']
//												},
//												caption: resources.localizableStrings.LinkedInValueCaption,
//												visible: {
//													bindTo: 'LinkedInSkype',
//													bindConfig: {
//														converter: function(value) {
//															return value != '';
//														}
//													}
//												}
//											},
											{
												className: 'Terrasoft.Container',
												id: 'linkedInSkypeContainer',
												selectors: {
													wrapEl: '#linkedInSkypeContainer'
												},
												classes: {
													wrapClassName: ['container-spacing']
												},
												items: [
													{
														className: 'Terrasoft.Container',
														id: 'linkedIn-skype-radiobutton',
														selectors: {
															wrapEl: '#linkedIn-skype-radiobutton'
														},
														classes: {
															wrapClassName: ['radiobutton-left']
														},
														items: [
															{
																className: 'Terrasoft.RadioButton',
																tag: 'LinkedInSkype',
																checked: {
																	bindTo: 'defSkypeTag'
																},
																visible: {
																	bindTo: 'LinkedInSkype',
																	bindConfig: {
																		converter: function(value) {
																			return value != '';
																		}
																	}
																}
															}
														]
													},
													{
														className: 'Terrasoft.Container',
														id: 'linkedIn-skype-textedit',
														selectors: {
															wrapEl: '#linkedIn-skype-textedit'
														},
														classes: {
															wrapClassName: ['textedit-right']
														},
														items: [
															{
																className: 'Terrasoft.TextEdit',
																value: {
																	bindTo: 'LinkedInSkype'
																},
																visible: {
																	bindTo: 'LinkedInSkype',
																	bindConfig: {
																		converter: function(value) {
																			return value != '';
																		}
																	}
																},
																enabled: false
															}
														]
													}
												]
											},
											{
												className: 'Terrasoft.Label',
												classes: {
													labelClass: ['labelEdit']
												},
												caption: resources.localizableStrings.TwitterValueCaption,
												visible: {
													bindTo: 'TwitterSkype',
													bindConfig: {
														converter: function(value) {
															return value != '';
														}
													}
												}
											},
											{
												className: 'Terrasoft.Container',
												id: 'twitterSkypeContainer',
												selectors: {
													wrapEl: '#twitterSkypeContainer'
												},
												classes: {
													wrapClassName: ['container-spacing']
												},
												items: [
													{
														className: 'Terrasoft.Container',
														id: 'twitter-skype-radiobutton',
														selectors: {
															wrapEl: '#twitter-skype-radiobutton'
														},
														classes: {
															wrapClassName: ['radiobutton-left']
														},
														items: [
															{
																className: 'Terrasoft.RadioButton',
																tag: 'TwitterSkype',
																checked: {
																	bindTo: 'defSkypeTag'
																},
																visible: {
																	bindTo: 'TwitterSkype',
																	bindConfig: {
																		converter: function(value) {
																			return value != '';
																		}
																	}
																}
															}
														]
													},
													{
														className: 'Terrasoft.Container',
														id: 'twitter-skype-textedit',
														selectors: {
															wrapEl: '#twitter-skype-textedit'
														},
														classes: {
															wrapClassName: ['textedit-right']
														},
														items: [
															{
																className: 'Terrasoft.TextEdit',
																value: {
																	bindTo: 'TwitterSkype'
																},
																visible: {
																	bindTo: 'TwitterSkype',
																	bindConfig: {
																		converter: function(value) {
																			return value != '';
																		}
																	}
																},
																enabled: false
															}
														]
													}
												]
											}
										]
									}
								]
							}
						]
					},
					{
						className: 'Terrasoft.Label',
						classes: {
							labelClass: ['labelEdit']
						},
						caption: resources.localizableStrings.BirthDateCaption,
						visible: {
							bindTo: 'isBirthDateContainerVisible'
						}
					},
					{
						className: 'Terrasoft.Container',
						id: 'birthDateContainer',
						classes: {
							wrapClassName: [
								'container-spacing',
								'table-row'
							]
						},
						selectors: {
							wrapEl: '#birthDateContainer'
						},
						visible: {
							bindTo: 'isBirthDateContainerVisible'
						},
						items: [
							{
								className: 'Terrasoft.Container',
								id: 'leftbirthDateContainer',
								classes: {
									wrapClassName: [
										'left-container',
										'table-cell'
									]
								},
								selectors: {
									wrapEl: '#leftbirthDateContainer'
								},
								items: [
									{
										className: 'Terrasoft.DateEdit',
										value: {
											bindTo: 'resultBirthDate'
										}
									}
								]
							},
							{
								className: 'Terrasoft.Container',
								id: 'rightbirthDateContainer',
								classes: {
									wrapClassName: [
										'right-container',
										'table-cell'
									]
								},
								selectors: {
									wrapEl: '#rightbirthDateContainer'
								},
								items: [
									{
										className: 'Terrasoft.ControlGroup',
										id: 'birthDateControlGroup',
										selectors: {
											wrapEl: '#birthDateControlGroup'
										},
										collapsed: true,
										caption: resources.localizableStrings.BirthDateCaption,
										items: [
											{
												className: 'Terrasoft.Label',
												classes: {
													labelClass: ['labelEdit']
												},
												caption: resources.localizableStrings.CurrentValueCaption,
												visible: true
											},
											{
												className: 'Terrasoft.Container',
												id: 'initBirthDateContainer',
												selectors: {
													wrapEl: '#initBirthDateContainer'
												},
												classes: {
													wrapClassName: ['container-spacing']
												},
												items: [
													{
														className: 'Terrasoft.Container',
														id: 'init-birthDate-radiobutton',
														selectors: {
															wrapEl: '#init-birthDate-radiobutton'
														},
														classes: {
															wrapClassName: ['radiobutton-left']
														},
														items: [
															{
																className: 'Terrasoft.RadioButton',
																tag: 'initBirthDate',
																checked: {
																	bindTo: 'defBirthDateTag'
																}
															}
														]
													},
													{
														className: 'Terrasoft.Container',
														id: 'init-birthDate-textedit',
														selectors: {
															wrapEl: '#init-birthDate-textedit'
														},
														classes: {
															wrapClassName: ['textedit-right']
														},
														items: [
															{
																className: 'Terrasoft.DateEdit',
																value: {
																	bindTo: 'initBirthDate'
																},
																enabled: false
															}
														]
													}
												]
											},
											{
												className: 'Terrasoft.Label',
												classes: {
													labelClass: ['labelEdit']
												},
												caption: resources.localizableStrings.FacebookValueCaption,
												visible: {
													bindTo: 'FacebookBirthDate',
													bindConfig: {
														converter: function(value) {
															return value != '';
														}
													}
												}
											},
											{
												className: 'Terrasoft.Container',
												id: 'facebookBirthDateContainer',
												selectors: {
													wrapEl: '#facebookBirthDateContainer'
												},
												classes: {
													wrapClassName: ['container-spacing']
												},
												items: [
													{
														className: 'Terrasoft.Container',
														id: 'facebook-birthDate-radiobutton',
														selectors: {
															wrapEl: '#facebook-birthDate-radiobutton'
														},
														classes: {
															wrapClassName: ['radiobutton-left']
														},
														items: [
															{
																className: 'Terrasoft.RadioButton',
																tag: 'FacebookBirthDate',
																checked: {
																	bindTo: 'defBirthDateTag'
																},
																visible: {
																	bindTo: 'FacebookBirthDate',
																	bindConfig: {
																		converter: function(value) {
																			return value != '';
																		}
																	}
																}
															}
														]
													},
													{
														className: 'Terrasoft.Container',
														id: 'facebook-birthDate-textedit',
														selectors: {
															wrapEl: '#facebook-birthDate-textedit'
														},
														classes: {
															wrapClassName: ['textedit-right']
														},
														items: [
															{
																className: 'Terrasoft.TextEdit',
																value: {
																	bindTo: 'FacebookBirthDate'
																},
																visible: {
																	bindTo: 'FacebookBirthDate',
																	bindConfig: {
																		converter: function(value) {
																			return value != '';
																		}
																	}
																},
																enabled: false
															}
														]
													}
												]
											},
											/**
											* Блок, отвечающий за интеграцию с LinkedIn
											*/
//											{
//												className: 'Terrasoft.Label',
//												classes: {
//													labelClass: ['labelEdit']
//												},
//												caption: resources.localizableStrings.LinkedInValueCaption,
//												visible: {
//													bindTo: 'LinkedInBirthDate',
//													bindConfig: {
//														converter: function(value) {
//															return value != '';
//														}
//													}
//												}
//											},
											{
												className: 'Terrasoft.Container',
												id: 'linkedInBirthDateContainer',
												selectors: {
													wrapEl: '#linkedInBirthDateContainer'
												},
												classes: {
													wrapClassName: ['container-spacing']
												},
												items: [
													{
														className: 'Terrasoft.Container',
														id: 'linkedIn-birthDate-radiobutton',
														selectors: {
															wrapEl: '#linkedIn-birthDate-radiobutton'
														},
														classes: {
															wrapClassName: ['radiobutton-left']
														},
														items: [
															{
																className: 'Terrasoft.RadioButton',
																tag: 'LinkedInBirthDate',
																checked: {
																	bindTo: 'defBirthDateTag'
																},
																visible: {
																	bindTo: 'LinkedInBirthDate',
																	bindConfig: {
																		converter: function(value) {
																			return value != '';
																		}
																	}
																}
															}
														]
													},
													{
														className: 'Terrasoft.Container',
														id: 'linkedIn-birthDate-textedit',
														selectors: {
															wrapEl: '#linkedIn-birthDate-textedit'
														},
														classes: {
															wrapClassName: ['textedit-right']
														},
														items: [
															{
																className: 'Terrasoft.TextEdit',
																value: {
																	bindTo: 'LinkedInBirthDate'
																},
																visible: {
																	bindTo: 'LinkedInBirthDate',
																	bindConfig: {
																		converter: function(value) {
																			return value != '';
																		}
																	}
																},
																enabled: false
															}
														]
													}
												]
											},
											{
												className: 'Terrasoft.Label',
												classes: {
													labelClass: ['labelEdit']
												},
												caption: resources.localizableStrings.TwitterValueCaption,
												visible: {
													bindTo: 'TwitterBirthDate',
													bindConfig: {
														converter: function(value) {
															return value != '';
														}
													}
												}
											},
											{
												className: 'Terrasoft.Container',
												id: 'twitterBirthDateContainer',
												selectors: {
													wrapEl: '#twitterBirthDateContainer'
												},
												classes: {
													wrapClassName: ['container-spacing']
												},
												items: [
													{
														className: 'Terrasoft.Container',
														id: 'twitter-birthDate-radiobutton',
														selectors: {
															wrapEl: '#twitter-birthDate-radiobutton'
														},
														classes: {
															wrapClassName: ['radiobutton-left']
														},
														items: [
															{
																className: 'Terrasoft.RadioButton',
																tag: 'TwitterBirthDate',
																checked: {
																	bindTo: 'defBirthDateTag'
																},
																visible: {
																	bindTo: 'TwitterBirthDate',
																	bindConfig: {
																		converter: function(value) {
																			return value != '';
																		}
																	}
																}
															}
														]
													},
													{
														className: 'Terrasoft.Container',
														id: 'twitter-birthDate-textedit',
														selectors: {
															wrapEl: '#twitter-birthDate-textedit'
														},
														classes: {
															wrapClassName: ['textedit-right']
														},
														items: [
															{
																className: 'Terrasoft.TextEdit',
																value: {
																	bindTo: 'TwitterBirthDate'
																},
																visible: {
																	bindTo: 'TwitterBirthDate',
																	bindConfig: {
																		converter: function(value) {
																			return value != '';
																		}
																	}
																},
																enabled: false
															}
														]
													}
												]
											}
										]
									}
								]
							}
						]
					},
					{
						className: 'Terrasoft.Label',
						classes: {
							labelClass: ['labelEdit']
						},
						caption: resources.localizableStrings.JobTitleCaption,
						visible: {
							bindTo: 'isJobTitleContainerVisible'
						}
					},
					{
						className: 'Terrasoft.Container',
						id: 'jobTitleContainer',
						classes: {
							wrapClassName: [
								'container-spacing',
								'table-row'
							]
						},
						selectors: {
							wrapEl: '#jobTitleContainer'
						},
						visible: {
							bindTo: 'isJobTitleContainerVisible'
						},
						items: [
							{
								className: 'Terrasoft.Container',
								id: 'leftjobTitleContainer',
								classes: {
									wrapClassName: [
										'left-container',
										'table-cell'
									]
								},
								selectors: {
									wrapEl: '#leftjobTitleContainer'
								},
								items: [
									{
										className: 'Terrasoft.TextEdit',
										value: {
											bindTo: 'resultJobTitle'
										}
									}
								]
							},
							{
								className: 'Terrasoft.Container',
								id: 'rightjobTitleContainer',
								classes: {
									wrapClassName: [
										'right-container',
										'table-cell'
									]
								},
								selectors: {
									wrapEl: '#rightjobTitleContainer'
								},
								items: [
									{
										className: 'Terrasoft.ControlGroup',
										id: 'jobTitleControlGroup',
										selectors: {
											wrapEl: '#jobTitleControlGroup'
										},
										collapsed: true,
										caption: resources.localizableStrings.JobTitleCaption,
										items: [
											{
												className: 'Terrasoft.Label',
												classes: {
													labelClass: ['labelEdit']
												},
												caption: resources.localizableStrings.CurrentValueCaption,
												visible: true
											},
											{
												className: 'Terrasoft.Container',
												id: 'initJobTitleContainer',
												selectors: {
													wrapEl: '#initJobTitleContainer'
												},
												classes: {
													wrapClassName: ['container-spacing']
												},
												items: [
													{
														className: 'Terrasoft.Container',
														id: 'init-jobTitle-radiobutton',
														selectors: {
															wrapEl: '#init-jobTitle-radiobutton'
														},
														classes: {
															wrapClassName: ['radiobutton-left']
														},
														items: [
															{
																className: 'Terrasoft.RadioButton',
																tag: 'initJobTitle',
																checked: {
																	bindTo: 'defJobTitleTag'
																}
															}
														]
													},
													{
														className: 'Terrasoft.Container',
														id: 'init-jobTitle-textedit',
														selectors: {
															wrapEl: '#init-jobTitle-textedit'
														},
														classes: {
															wrapClassName: ['textedit-right']
														},
														items: [
															{
																className: 'Terrasoft.TextEdit',
																value: {
																	bindTo: 'initJobTitle'
																},
																enabled: false
															}
														]
													}
												]
											},
											{
												className: 'Terrasoft.Label',
												classes: {
													labelClass: ['labelEdit']
												},
												caption: resources.localizableStrings.FacebookValueCaption,
												visible: {
													bindTo: 'FacebookJobTitle',
													bindConfig: {
														converter: function(value) {
															return value != '';
														}
													}
												}
											},
											{
												className: 'Terrasoft.Container',
												id: 'facebookJobTitleContainer',
												selectors: {
													wrapEl: '#facebookJobTitleContainer'
												},
												classes: {
													wrapClassName: ['container-spacing']
												},
												items: [
													{
														className: 'Terrasoft.Container',
														id: 'facebook-jobTitle-radiobutton',
														selectors: {
															wrapEl: '#facebook-jobTitle-radiobutton'
														},
														classes: {
															wrapClassName: ['radiobutton-left']
														},
														items: [
															{
																className: 'Terrasoft.RadioButton',
																tag: 'FacebookJobTitle',
																checked: {
																	bindTo: 'defJobTitleTag'
																},
																visible: {
																	bindTo: 'FacebookJobTitle',
																	bindConfig: {
																		converter: function(value) {
																			return value != '';
																		}
																	}
																}
															}
														]
													},
													{
														className: 'Terrasoft.Container',
														id: 'facebook-jobTitle-textedit',
														selectors: {
															wrapEl: '#facebook-jobTitle-textedit'
														},
														classes: {
															wrapClassName: ['textedit-right']
														},
														items: [
															{
																className: 'Terrasoft.TextEdit',
																value: {
																	bindTo: 'FacebookJobTitle'
																},
																visible: {
																	bindTo: 'FacebookJobTitle',
																	bindConfig: {
																		converter: function(value) {
																			return value != '';
																		}
																	}
																},
																enabled: false
															}
														]
													}
												]
											},
											/**
											* Блок, отвечающий за интеграцию с LinkedIn
											*/
//											{
//												className: 'Terrasoft.Label',
//												classes: {
//													labelClass: ['labelEdit']
//												},
//												caption: resources.localizableStrings.LinkedInValueCaption,
//												visible: {
//													bindTo: 'LinkedInJobTitle',
//													bindConfig: {
//														converter: function(value) {
//															return value != '';
//														}
//													}
//												}
//											},
											{
												className: 'Terrasoft.Container',
												id: 'linkedInJobTitleContainer',
												selectors: {
													wrapEl: '#linkedInJobTitleContainer'
												},
												classes: {
													wrapClassName: ['container-spacing']
												},
												items: [
													{
														className: 'Terrasoft.Container',
														id: 'linkedIn-jobTitle-radiobutton',
														selectors: {
															wrapEl: '#linkedIn-jobTitle-radiobutton'
														},
														classes: {
															wrapClassName: ['radiobutton-left']
														},
														items: [
															{
																className: 'Terrasoft.RadioButton',
																tag: 'LinkedInJobTitle',
																checked: {
																	bindTo: 'defJobTitleTag'
																},
																visible: {
																	bindTo: 'LinkedInJobTitle',
																	bindConfig: {
																		converter: function(value) {
																			return value != '';
																		}
																	}
																}
															}
														]
													},
													{
														className: 'Terrasoft.Container',
														id: 'linkedIn-jobTitle-textedit',
														selectors: {
															wrapEl: '#linkedIn-jobTitle-textedit'
														},
														classes: {
															wrapClassName: ['textedit-right']
														},
														items: [
															{
																className: 'Terrasoft.TextEdit',
																value: {
																	bindTo: 'LinkedInJobTitle'
																},
																visible: {
																	bindTo: 'LinkedInJobTitle',
																	bindConfig: {
																		converter: function(value) {
																			return value != '';
																		}
																	}
																},
																enabled: false
															}
														]
													}
												]
											},
											{
												className: 'Terrasoft.Label',
												classes: {
													labelClass: ['labelEdit']
												},
												caption: resources.localizableStrings.TwitterValueCaption,
												visible: {
													bindTo: 'TwitterJobTitle',
													bindConfig: {
														converter: function(value) {
															return value != '';
														}
													}
												}
											},
											{
												className: 'Terrasoft.Container',
												id: 'twitterJobTitleContainer',
												selectors: {
													wrapEl: '#twitterJobTitleContainer'
												},
												classes: {
													wrapClassName: ['container-spacing']
												},
												items: [
													{
														className: 'Terrasoft.Container',
														id: 'twitter-jobTitle-radiobutton',
														selectors: {
															wrapEl: '#twitter-jobTitle-radiobutton'
														},
														classes: {
															wrapClassName: ['radiobutton-left']
														},
														items: [
															{
																className: 'Terrasoft.RadioButton',
																tag: 'TwitterJobTitle',
																checked: {
																	bindTo: 'defJobTitleTag'
																},
																visible: {
																	bindTo: 'TwitterJobTitle',
																	bindConfig: {
																		converter: function(value) {
																			return value != '';
																		}
																	}
																}
															}
														]
													},
													{
														className: 'Terrasoft.Container',
														id: 'twitter-jobTitle-textedit',
														selectors: {
															wrapEl: '#twitter-jobTitle-textedit'
														},
														classes: {
															wrapClassName: ['textedit-right']
														},
														items: [
															{
																className: 'Terrasoft.TextEdit',
																value: {
																	bindTo: 'TwitterJobTitle'
																},
																visible: {
																	bindTo: 'TwitterJobTitle',
																	bindConfig: {
																		converter: function(value) {
																			return value != '';
																		}
																	}
																},
																enabled: false
															}
														]
													}
												]
											}
										]
									}
								]
							}
						]
					},
					{
						className: 'Terrasoft.Label',
						classes: {
							labelClass: ['labelEdit']
						},
						caption: resources.localizableStrings.AddressCaption,
						visible: {
							bindTo: 'isAddressContainerVisible'
						}
					},
					{
						className: 'Terrasoft.Container',
						id: 'addressContainer',
						classes: {
							wrapClassName: [
								'container-spacing',
								'table-row'
							]
						},
						selectors: {
							wrapEl: '#addressContainer'
						},
						visible: {
							bindTo: 'isAddressContainerVisible'
						},
						items: [
							{
								className: 'Terrasoft.Container',
								id: 'leftaddressContainer',
								classes: {
									wrapClassName: [
										'left-container',
										'table-cell'
									]
								},
								selectors: {
									wrapEl: '#leftaddressContainer'
								},
								items: [
									{
										className: 'Terrasoft.TextEdit',
										value: {
											bindTo: 'resultAddress'
										}
									}
								]
							},
							{
								className: 'Terrasoft.Container',
								id: 'rightaddressContainer',
								classes: {
									wrapClassName: [
										'right-container',
										'table-cell'
									]
								},
								selectors: {
									wrapEl: '#rightaddressContainer'
								},
								items: [
									{
										className: 'Terrasoft.ControlGroup',
										id: 'addressControlGroup',
										selectors: {
											wrapEl: '#addressControlGroup'
										},
										collapsed: true,
										caption: resources.localizableStrings.AddressCaption,
										items: [
											{
												className: 'Terrasoft.Label',
												classes: {
													labelClass: ['labelEdit']
												},
												caption: resources.localizableStrings.CurrentValueCaption,
												visible: true
											},
											{
												className: 'Terrasoft.Container',
												id: 'initAddressContainer',
												selectors: {
													wrapEl: '#initAddressContainer'
												},
												classes: {
													wrapClassName: ['container-spacing']
												},
												items: [
													{
														className: 'Terrasoft.Container',
														id: 'init-address-radiobutton',
														selectors: {
															wrapEl: '#init-address-radiobutton'
														},
														classes: {
															wrapClassName: ['radiobutton-left']
														},
														items: [
															{
																className: 'Terrasoft.RadioButton',
																tag: 'initAddress',
																checked: {
																	bindTo: 'defAddressTag'
																}
															}
														]
													},
													{
														className: 'Terrasoft.Container',
														id: 'init-address-textedit',
														selectors: {
															wrapEl: '#init-address-textedit'
														},
														classes: {
															wrapClassName: ['textedit-right']
														},
														items: [
															{
																className: 'Terrasoft.TextEdit',
																value: {
																	bindTo: 'initAddress'
																},
																enabled: false
															}
														]
													}
												]
											},
											{
												className: 'Terrasoft.Label',
												classes: {
													labelClass: ['labelEdit']
												},
												caption: resources.localizableStrings.FacebookValueCaption,
												visible: {
													bindTo: 'FacebookAddress',
													bindConfig: {
														converter: function(value) {
															return value != '';
														}
													}
												}
											},
											{
												className: 'Terrasoft.Container',
												id: 'facebookAddressContainer',
												selectors: {
													wrapEl: '#facebookAddressContainer'
												},
												classes: {
													wrapClassName: ['container-spacing']
												},
												items: [
													{
														className: 'Terrasoft.Container',
														id: 'facebook-address-radiobutton',
														selectors: {
															wrapEl: '#facebook-address-radiobutton'
														},
														classes: {
															wrapClassName: ['radiobutton-left']
														},
														items: [
															{
																className: 'Terrasoft.RadioButton',
																tag: 'FacebookAddress',
																checked: {
																	bindTo: 'defAddressTag'
																},
																visible: {
																	bindTo: 'FacebookAddress',
																	bindConfig: {
																		converter: function(value) {
																			return value != '';
																		}
																	}
																}
															}
														]
													},
													{
														className: 'Terrasoft.Container',
														id: 'facebook-address-textedit',
														selectors: {
															wrapEl: '#facebook-address-textedit'
														},
														classes: {
															wrapClassName: ['textedit-right']
														},
														items: [
															{
																className: 'Terrasoft.TextEdit',
																value: {
																	bindTo: 'FacebookAddress'
																},
																visible: {
																	bindTo: 'FacebookAddress',
																	bindConfig: {
																		converter: function(value) {
																			return value != '';
																		}
																	}
																},
																enabled: false
															}
														]
													}
												]
											},
											/**
											* Блок, отвечающий за интеграцию с LinkedIn
											*/
//											{
//												className: 'Terrasoft.Label',
//												classes: {
//													labelClass: ['labelEdit']
//												},
//												caption: resources.localizableStrings.LinkedInValueCaption,
//												visible: {
//													bindTo: 'LinkedInAddress',
//													bindConfig: {
//														converter: function(value) {
//															return value != '';
//														}
//													}
//												}
//											},
											/**
											* Блок, отвечающий за интеграцию с LinkedIn
											*/
//											{
//												className: 'Terrasoft.Container',
//												id: 'linkedInAddressContainer',
//												selectors: {
//													wrapEl: '#linkedInAddressContainer'
//												},
//												classes: {
//													wrapClassName: ['container-spacing']
//												},
//												items: [
//													{
//														className: 'Terrasoft.Container',
//														id: 'linkedIn-address-radiobutton',
//														selectors: {
//															wrapEl: '#linkedIn-address-radiobutton'
//														},
//														classes: {
//															wrapClassName: ['radiobutton-left']
//														},
//														items: [
//															{
//																className: 'Terrasoft.RadioButton',
//																tag: 'LinkedInAddress',
//																checked: {
//																	bindTo: 'defAddressTag'
//																},
//																visible: {
//																	bindTo: 'LinkedInAddress',
//																	bindConfig: {
//																		converter: function(value) {
//																			return value != '';
//																		}
//																	}
//																}
//															}
//														]
//													},
//													{
//														className: 'Terrasoft.Container',
//														id: 'linkedIn-address-textedit',
//														selectors: {
//															wrapEl: '#linkedIn-address-textedit'
//														},
//														classes: {
//															wrapClassName: ['textedit-right']
//														},
//														items: [
//															{
//																className: 'Terrasoft.TextEdit',
//																value: {
//																	bindTo: 'LinkedInAddress'
//																},
//																visible: {
//																	bindTo: 'LinkedInAddress',
//																	bindConfig: {
//																		converter: function(value) {
//																			return value != '';
//																		}
//																	}
//																},
//																enabled: false
//															}
//														]
//													}
//												]
//											},
											{
												className: 'Terrasoft.Label',
												classes: {
													labelClass: ['labelEdit']
												},
												caption: resources.localizableStrings.TwitterValueCaption,
												visible: {
													bindTo: 'TwitterAddress',
													bindConfig: {
														converter: function(value) {
															return value != '';
														}
													}
												}
											},
											{
												className: 'Terrasoft.Container',
												id: 'twitterAddressContainer',
												selectors: {
													wrapEl: '#twitterAddressContainer'
												},
												classes: {
													wrapClassName: ['container-spacing']
												},
												items: [
													{
														className: 'Terrasoft.Container',
														id: 'twitter-address-radiobutton',
														selectors: {
															wrapEl: '#twitter-address-radiobutton'
														},
														classes: {
															wrapClassName: ['radiobutton-left']
														},
														items: [
															{
																className: 'Terrasoft.RadioButton',
																tag: 'TwitterAddress',
																checked: {
																	bindTo: 'defAddressTag'
																},
																visible: {
																	bindTo: 'TwitterAddress',
																	bindConfig: {
																		converter: function(value) {
																			return value != '';
																		}
																	}
																}
															}
														]
													},
													{
														className: 'Terrasoft.Container',
														id: 'twitter-address-textedit',
														selectors: {
															wrapEl: '#twitter-address-textedit'
														},
														classes: {
															wrapClassName: ['textedit-right']
														},
														items: [
															{
																className: 'Terrasoft.TextEdit',
																value: {
																	bindTo: 'TwitterAddress'
																},
																visible: {
																	bindTo: 'TwitterAddress',
																	bindConfig: {
																		converter: function(value) {
																			return value != '';
																		}
																	}
																},
																enabled: false
															}
														]
													}
												]
											}
										]
									}
								]
							}
						]
					},
					{
						className: 'Terrasoft.Label',
						classes: {
							labelClass: ['labelEdit']
						},
						caption: resources.localizableStrings.NotesCaption,
						visible: {
							bindTo: 'isNotesContainerVisible'
						}
					},
					{
						className: 'Terrasoft.Container',
						id: 'notesContainer',
						classes: {
							wrapClassName: [
								'container-spacing',
								'table-row'
							]
						},
						selectors: {
							wrapEl: '#notesContainer'
						},
						visible: {
							bindTo: 'isNotesContainerVisible'
						},
						items: [
							{
								className: 'Terrasoft.Container',
								id: 'leftnotesContainer',
								classes: {
									wrapClassName: [
										'left-container',
										'table-cell'
									]
								},
								selectors: {
									wrapEl: '#leftnotesContainer'
								},
								items: [
									{
										className: 'Terrasoft.TextEdit',
										value: {
											bindTo: 'resultNotes'
										}
									}
								]
							},
							{
								className: 'Terrasoft.Container',
								id: 'rightnotesContainer',
								classes: {
									wrapClassName: [
										'right-container',
										'table-cell'
									]
								},
								selectors: {
									wrapEl: '#rightnotesContainer'
								},
								items: [
									{
										className: 'Terrasoft.ControlGroup',
										id: 'notesControlGroup',
										selectors: {
											wrapEl: '#notesControlGroup'
										},
										collapsed: true,
										caption: resources.localizableStrings.NotesCaption,
										items: [
											{
												className: 'Terrasoft.Label',
												classes: {
													labelClass: ['labelEdit']
												},
												caption: resources.localizableStrings.CurrentValueCaption,
												visible: true
											},
											{
												className: 'Terrasoft.Container',
												id: 'initNotesContainer',
												selectors: {
													wrapEl: '#initNotesContainer'
												},
												classes: {
													wrapClassName: ['container-spacing']
												},
												items: [
													{
														className: 'Terrasoft.Container',
														id: 'init-notes-radiobutton',
														selectors: {
															wrapEl: '#init-notes-radiobutton'
														},
														classes: {
															wrapClassName: ['radiobutton-left']
														},
														items: [
															{
																className: 'Terrasoft.RadioButton',
																tag: 'initNotes',
																checked: {
																	bindTo: 'defNotesTag'
																}
															}
														]
													},
													{
														className: 'Terrasoft.Container',
														id: 'init-notes-textedit',
														selectors: {
															wrapEl: '#init-notes-textedit'
														},
														classes: {
															wrapClassName: ['textedit-right']
														},
														items: [
															{
																className: 'Terrasoft.TextEdit',
																value: {
																	bindTo: 'initNotes'
																},
																enabled: false
															}
														]
													}
												]
											},
											{
												className: 'Terrasoft.Label',
												classes: {
													labelClass: ['labelEdit']
												},
												caption: resources.localizableStrings.FacebookValueCaption,
												visible: {
													bindTo: 'FacebookNotes',
													bindConfig: {
														converter: function(value) {
															return value != '';
														}
													}
												}
											},
											{
												className: 'Terrasoft.Container',
												id: 'facebookNotesContainer',
												selectors: {
													wrapEl: '#facebookNotesContainer'
												},
												classes: {
													wrapClassName: ['container-spacing']
												},
												items: [
													{
														className: 'Terrasoft.Container',
														id: 'facebook-notes-radiobutton',
														selectors: {
															wrapEl: '#facebook-notes-radiobutton'
														},
														classes: {
															wrapClassName: ['radiobutton-left']
														},
														items: [
															{
																className: 'Terrasoft.RadioButton',
																tag: 'FacebookNotes',
																checked: {
																	bindTo: 'defNotesTag'
																},
																visible: {
																	bindTo: 'FacebookNotes',
																	bindConfig: {
																		converter: function(value) {
																			return value != '';
																		}
																	}
																}
															}
														]
													},
													{
														className: 'Terrasoft.Container',
														id: 'facebook-notes-textedit',
														selectors: {
															wrapEl: '#facebook-notes-textedit'
														},
														classes: {
															wrapClassName: ['textedit-right']
														},
														items: [
															{
																className: 'Terrasoft.TextEdit',
																value: {
																	bindTo: 'FacebookNotes'
																},
																visible: {
																	bindTo: 'FacebookNotes',
																	bindConfig: {
																		converter: function(value) {
																			return value != '';
																		}
																	}
																},
																enabled: false
															}
														]
													}
												]
											},
											/**
											* Блок, отвечающий за интеграцию с LinkedIn
											*/
//											{
//												className: 'Terrasoft.Label',
//												classes: {
//													labelClass: ['labelEdit']
//												},
//												caption: resources.localizableStrings.LinkedInValueCaption,
//												visible: {
//													bindTo: 'LinkedInNotes',
//													bindConfig: {
//														converter: function(value) {
//															return value != '';
//														}
//													}
//												}
//											},
											/**
											* Блок, отвечающий за интеграцию с LinkedIn
											*/
//											{
//												className: 'Terrasoft.Container',
//												id: 'linkedInNotesContainer',
//												selectors: {
//													wrapEl: '#linkedInNotesContainer'
//												},
//												classes: {
//													wrapClassName: ['container-spacing']
//												},
//												items: [
//													{
//														className: 'Terrasoft.Container',
//														id: 'linkedIn-notes-radiobutton',
//														selectors: {
//															wrapEl: '#linkedIn-notes-radiobutton'
//														},
//														classes: {
//															wrapClassName: ['radiobutton-left']
//														},
//														items: [
//															{
//																className: 'Terrasoft.RadioButton',
//																tag: 'LinkedInNotes',
//																checked: {
//																	bindTo: 'defNotesTag'
//																},
//																visible: {
//																	bindTo: 'LinkedInNotes',
//																	bindConfig: {
//																		converter: function(value) {
//																			return value != '';
//																		}
//																	}
//																}
//															}
//														]
//													},
//													{
//														className: 'Terrasoft.Container',
//														id: 'linkedIn-notes-textedit',
//														selectors: {
//															wrapEl: '#linkedIn-notes-textedit'
//														},
//														classes: {
//															wrapClassName: ['textedit-right']
//														},
//														items: [
//															{
//																className: 'Terrasoft.TextEdit',
//																value: {
//																	bindTo: 'LinkedInNotes'
//																},
//																visible: {
//																	bindTo: 'LinkedInNotes',
//																	bindConfig: {
//																		converter: function(value) {
//																			return value != '';
//																		}
//																	}
//																},
//																enabled: false
//															}
//														]
//													}
//												]
//											},
											{
												className: 'Terrasoft.Label',
												classes: {
													labelClass: ['labelEdit']
												},
												caption: resources.localizableStrings.TwitterValueCaption,
												visible: {
													bindTo: 'TwitterNotes',
													bindConfig: {
														converter: function(value) {
															return value != '';
														}
													}
												}
											},
											{
												className: 'Terrasoft.Container',
												id: 'twitterNotesContainer',
												selectors: {
													wrapEl: '#twitterNotesContainer'
												},
												classes: {
													wrapClassName: ['container-spacing']
												},
												items: [
													{
														className: 'Terrasoft.Container',
														id: 'twitter-notes-radiobutton',
														selectors: {
															wrapEl: '#twitter-notes-radiobutton'
														},
														classes: {
															wrapClassName: ['radiobutton-left']
														},
														items: [
															{
																className: 'Terrasoft.RadioButton',
																tag: 'TwitterNotes',
																checked: {
																	bindTo: 'defNotesTag'
																},
																visible: {
																	bindTo: 'TwitterNotes',
																	bindConfig: {
																		converter: function(value) {
																			return value != '';
																		}
																	}
																}
															}
														]
													},
													{
														className: 'Terrasoft.Container',
														id: 'twitter-notes-textedit',
														selectors: {
															wrapEl: '#twitter-notes-textedit'
														},
														classes: {
															wrapClassName: ['textedit-right']
														},
														items: [
															{
																className: 'Terrasoft.TextEdit',
																value: {
																	bindTo: 'TwitterNotes'
																},
																visible: {
																	bindTo: 'TwitterNotes',
																	bindConfig: {
																		converter: function(value) {
																			return value != '';
																		}
																	}
																},
																enabled: false
															}
														]
													}
												]
											}
										]
									}
								]
							}
						]
					},
					{
						className: 'Terrasoft.Label',
						classes: {
							labelClass: ['div-caption-label']
						},
						caption: resources.localizableStrings.FillValues,
						visible: true
					},
					{
						className: 'Terrasoft.Label',
						classes: {
							labelClass: ['labelEdit']
						},
						caption: resources.localizableStrings.GenderCaption,
						visible: {
							bindTo: 'isGenderContainerVisible'
						}
					},
					{
						className: 'Terrasoft.Container',
						id: 'genderContainer',
						classes: {
							wrapClassName: [
								'container-spacing',
								'table-row'
							]
						},
						selectors: {
							wrapEl: '#genderContainer'
						},
						visible: {
							bindTo: 'isGenderContainerVisible'
						},
						items: [
							{
								className: 'Terrasoft.Container',
								id: 'leftgenderContainer',
								classes: {
									wrapClassName: [
										'left-container',
										'table-cell'
									]
								},
								selectors: {
									wrapEl: '#leftgenderContainer'
								},
								items: [
									{
										className: 'Terrasoft.ComboBoxEdit',
										value: {
											bindTo: 'resultGender'
										},
										list:{
											bindTo: 'genderList'
										},
										prepareList:{
											bindTo: 'getGenderList'
										}
									}
								]
							},
							{
								className: 'Terrasoft.Container',
								id: 'rightgenderContainer',
								classes: {
									wrapClassName: [
										'right-container',
										'table-cell'
									]
								},
								selectors: {
									wrapEl: '#rightgenderContainer'
								},
								items: [
									{
										className: 'Terrasoft.ControlGroup',
										id: 'genderControlGroup',
										selectors: {
											wrapEl: '#genderControlGroup'
										},
										collapsed: true,
										caption: resources.localizableStrings.GenderCaption,
										items: [
											{
												className: 'Terrasoft.Label',
												classes: {
													labelClass: ['labelEdit']
												},
												caption: resources.localizableStrings.CurrentValueCaption,
												visible: true
											},
											{
												className: 'Terrasoft.Container',
												id: 'initGenderContainer',
												selectors: {
													wrapEl: '#initGenderContainer'
												},
												classes: {
													wrapClassName: ['container-spacing']
												},
												items: [
													{
														className: 'Terrasoft.Container',
														id: 'init-gender-textedit',
														selectors: {
															wrapEl: '#init-gender-textedit'
														},
														classes: {
															wrapClassName: ['textedit-right']
														},
														items: [
															{
																className: 'Terrasoft.ComboBoxEdit',
																value: {
																	bindTo: 'initGender'
																},
																enabled: false
															}
														]
													}
												]
											},
											{
												className: 'Terrasoft.Label',
												classes: {
													labelClass: ['labelEdit']
												},
												caption: resources.localizableStrings.FacebookValueCaption,
												visible: {
													bindTo: 'FacebookGender',
													bindConfig: {
														converter: function(value) {
															return value != '';
														}
													}
												}
											},
											{
												className: 'Terrasoft.Container',
												id: 'facebookGenderContainer',
												selectors: {
													wrapEl: '#facebookGenderContainer'
												},
												classes: {
													wrapClassName: ['container-spacing']
												},
												items: [
													{
														className: 'Terrasoft.Container',
														id: 'facebook-gender-textedit',
														selectors: {
															wrapEl: '#facebook-gender-textedit'
														},
														classes: {
															wrapClassName: ['textedit-right']
														},
														items: [
															{
																className: 'Terrasoft.TextEdit',
																value: {
																	bindTo: 'FacebookGender'
																},
																visible: {
																	bindTo: 'FacebookGender',
																	bindConfig: {
																		converter: function(value) {
																			return value != '';
																		}
																	}
																},
																enabled: false
															}
														]
													}
												]
											},
											/**
											* Блок, отвечающий за интеграцию с LinkedIn
											*/
//											{
//												className: 'Terrasoft.Label',
//												classes: {
//													labelClass: ['labelEdit']
//												},
//												caption: resources.localizableStrings.LinkedInValueCaption,
//												visible: {
//													bindTo: 'LinkedInGender',
//													bindConfig: {
//														converter: function(value) {
//															return value != '';
//														}
//													}
//												}
//											},
											/**
											* Блок, отвечающий за интеграцию с LinkedIn
											*/
//											{
//												className: 'Terrasoft.Container',
//												id: 'linkedInGenderContainer',
//												selectors: {
//													wrapEl: '#linkedInGenderContainer'
//												},
//												classes: {
//													wrapClassName: ['container-spacing']
//												},
//												items: [
//													{
//														className: 'Terrasoft.Container',
//														id: 'linkedIn-gender-textedit',
//														selectors: {
//															wrapEl: '#linkedIn-gender-textedit'
//														},
//														classes: {
//															wrapClassName: ['textedit-right']
//														},
//														items: [
//															{
//																className: 'Terrasoft.TextEdit',
//																value: {
//																	bindTo: 'LinkedInGender'
//																},
//																visible: {
//																	bindTo: 'LinkedInGender',
//																	bindConfig: {
//																		converter: function(value) {
//																			return value != '';
//																		}
//																	}
//																},
//																enabled: false
//															}
//														]
//													}
//												]
//											},
											{
												className: 'Terrasoft.Label',
												classes: {
													labelClass: ['labelEdit']
												},
												caption: resources.localizableStrings.TwitterValueCaption,
												visible: {
													bindTo: 'TwitterGender',
													bindConfig: {
														converter: function(value) {
															return value != '';
														}
													}
												}
											},
											{
												className: 'Terrasoft.Container',
												id: 'twitterGenderContainer',
												selectors: {
													wrapEl: '#twitterGenderContainer'
												},
												classes: {
													wrapClassName: ['container-spacing']
												},
												items: [
													{
														className: 'Terrasoft.Container',
														id: 'twitter-gender-textedit',
														selectors: {
															wrapEl: '#twitter-gender-textedit'
														},
														classes: {
															wrapClassName: ['textedit-right']
														},
														items: [
															{
																className: 'Terrasoft.TextEdit',
																value: {
																	bindTo: 'TwitterGender'
																},
																visible: {
																	bindTo: 'TwitterGender',
																	bindConfig: {
																		converter: function(value) {
																			return value != '';
																		}
																	}
																},
																enabled: false
															}
														]
													}
												]
											}
										]
									}
								]
							}
						]
					},
					{
						className: 'Terrasoft.Label',
						classes: {
							labelClass: ['labelEdit']
						},
						caption: resources.localizableStrings.CountryCaption,
						visible: {
							bindTo: 'isCountryContainerVisible'
						}
					},
					{
						className: 'Terrasoft.Container',
						id: 'countryContainer',
						classes: {
							wrapClassName: [
								'container-spacing',
								'table-row'
							]
						},
						selectors: {
							wrapEl: '#countryContainer'
						},
						visible: {
							bindTo: 'isCountryContainerVisible'
						},
						items: [
							{
								className: 'Terrasoft.Container',
								id: 'leftcountryContainer',
								classes: {
									wrapClassName: [
										'left-container',
										'table-cell'
									]
								},
								selectors: {
									wrapEl: '#leftcountryContainer'
								},
								items: [
									{
										className: 'Terrasoft.ComboBoxEdit',
										value: {
											bindTo: 'resultCountry'
										},
										list:{
											bindTo: 'countryList'
										},
										prepareList:{
											bindTo: 'getCountryList'
										}
									}
								]
							},
							{
								className: 'Terrasoft.Container',
								id: 'rightcountryContainer',
								classes: {
									wrapClassName: [
										'right-container',
										'table-cell'
									]
								},
								selectors: {
									wrapEl: '#rightcountryContainer'
								},
								items: [
									{
										className: 'Terrasoft.ControlGroup',
										id: 'countryControlGroup',
										selectors: {
											wrapEl: '#countryControlGroup'
										},
										collapsed: true,
										caption: resources.localizableStrings.CountryCaption,
										items: [
											{
												className: 'Terrasoft.Label',
												classes: {
													labelClass: ['labelEdit']
												},
												caption: resources.localizableStrings.CurrentValueCaption,
												visible: true
											},
											{
												className: 'Terrasoft.Container',
												id: 'initCountryContainer',
												selectors: {
													wrapEl: '#initCountryContainer'
												},
												classes: {
													wrapClassName: ['container-spacing']
												},
												items: [
													{
														className: 'Terrasoft.Container',
														id: 'init-country-textedit',
														selectors: {
															wrapEl: '#init-country-textedit'
														},
														classes: {
															wrapClassName: ['textedit-right']
														},
														items: [
															{
																className: 'Terrasoft.ComboBoxEdit',
																value: {
																	bindTo: 'initCountry'
																},
																enabled: false
															}
														]
													}
												]
											},
											{
												className: 'Terrasoft.Label',
												classes: {
													labelClass: ['labelEdit']
												},
												caption: resources.localizableStrings.FacebookValueCaption,
												visible: {
													bindTo: 'FacebookCountry',
													bindConfig: {
														converter: function(value) {
															return value != '';
														}
													}
												}
											},
											{
												className: 'Terrasoft.Container',
												id: 'facebookCountryContainer',
												selectors: {
													wrapEl: '#facebookCountryContainer'
												},
												classes: {
													wrapClassName: ['container-spacing']
												},
												items: [
													{
														className: 'Terrasoft.Container',
														id: 'facebook-country-textedit',
														selectors: {
															wrapEl: '#facebook-country-textedit'
														},
														classes: {
															wrapClassName: ['textedit-right']
														},
														items: [
															{
																className: 'Terrasoft.TextEdit',
																value: {
																	bindTo: 'FacebookCountry'
																},
																visible: {
																	bindTo: 'FacebookCountry',
																	bindConfig: {
																		converter: function(value) {
																			return value != '';
																		}
																	}
																},
																enabled: false
															}
														]
													}
												]
											},
											/**
											* Блок, отвечающий за интеграцию с LinkedIn
											*/
//											{
//												className: 'Terrasoft.Label',
//												classes: {
//													labelClass: ['labelEdit']
//												},
//												caption: resources.localizableStrings.LinkedInValueCaption,
//												visible: {
//													bindTo: 'LinkedInCountry',
//													bindConfig: {
//														converter: function(value) {
//															return value != '';
//														}
//													}
//												}
//											},
											/**
											* Блок, отвечающий за интеграцию с LinkedIn
											*/
//											{
//												className: 'Terrasoft.Container',
//												id: 'linkedInCountryContainer',
//												selectors: {
//													wrapEl: '#linkedInCountryContainer'
//												},
//												classes: {
//													wrapClassName: ['container-spacing']
//												},
//												items: [
//													{
//														className: 'Terrasoft.Container',
//														id: 'linkedIn-country-textedit',
//														selectors: {
//															wrapEl: '#linkedIn-country-textedit'
//														},
//														classes: {
//															wrapClassName: ['textedit-right']
//														},
//														items: [
//															{
//																className: 'Terrasoft.TextEdit',
//																value: {
//																	bindTo: 'LinkedInCountry'
//																},
//																visible: {
//																	bindTo: 'LinkedInCountry',
//																	bindConfig: {
//																		converter: function(value) {
//																			return value != '';
//																		}
//																	}
//																},
//																enabled: false
//															}
//														]
//													}
//												]
//											},
											{
												className: 'Terrasoft.Label',
												classes: {
													labelClass: ['labelEdit']
												},
												caption: resources.localizableStrings.TwitterValueCaption,
												visible: {
													bindTo: 'TwitterCountry',
													bindConfig: {
														converter: function(value) {
															return value != '';
														}
													}
												}
											},
											{
												className: 'Terrasoft.Container',
												id: 'twitterCountryContainer',
												selectors: {
													wrapEl: '#twitterCountryContainer'
												},
												classes: {
													wrapClassName: ['container-spacing']
												},
												items: [
													{
														className: 'Terrasoft.Container',
														id: 'twitter-country-textedit',
														selectors: {
															wrapEl: '#twitter-country-textedit'
														},
														classes: {
															wrapClassName: ['textedit-right']
														},
														items: [
															{
																className: 'Terrasoft.TextEdit',
																value: {
																	bindTo: 'TwitterCountry'
																},
																visible: {
																	bindTo: 'TwitterCountry',
																	bindConfig: {
																		converter: function(value) {
																			return value != '';
																		}
																	}
																},
																enabled: false
															}
														]
													}
												]
											}
										]
									}
								]
							}
						]
					},
					{
						className: 'Terrasoft.Label',
						classes: {
							labelClass: ['labelEdit']
						},
						caption: resources.localizableStrings.CityCaption,
						visible: {
							bindTo: 'isCityContainerVisible'
						}
					},
					{
						className: 'Terrasoft.Container',
						id: 'cityContainer',
						classes: {
							wrapClassName: [
								'container-spacing',
								'table-row'
							]
						},
						selectors: {
							wrapEl: '#cityContainer'
						},
						visible: {
							bindTo: 'isCityContainerVisible'
						},
						items: [
							{
								className: 'Terrasoft.Container',
								id: 'leftcityContainer',
								classes: {
									wrapClassName: [
										'left-container',
										'table-cell'
									]
								},
								selectors: {
									wrapEl: '#leftcityContainer'
								},
								items: [
									{
										className: 'Terrasoft.ComboBoxEdit',
										value: {
											bindTo: 'resultCity'
										},
										list:{
											bindTo: 'cityList'
										},
										prepareList:{
											bindTo: 'getCityList'
										}
									}
								]
							},
							{
								className: 'Terrasoft.Container',
								id: 'rightcityContainer',
								classes: {
									wrapClassName: [
										'right-container',
										'table-cell'
									]
								},
								selectors: {
									wrapEl: '#rightcityContainer'
								},
								items: [
									{
										className: 'Terrasoft.ControlGroup',
										id: 'cityControlGroup',
										selectors: {
											wrapEl: '#cityControlGroup'
										},
										collapsed: true,
										caption: resources.localizableStrings.CityCaption,
										items: [
											{
												className: 'Terrasoft.Label',
												classes: {
													labelClass: ['labelEdit']
												},
												caption: resources.localizableStrings.CurrentValueCaption,
												visible: true
											},
											{
												className: 'Terrasoft.Container',
												id: 'initCityContainer',
												selectors: {
													wrapEl: '#initCityContainer'
												},
												classes: {
													wrapClassName: ['container-spacing']
												},
												items: [
													{
														className: 'Terrasoft.Container',
														id: 'init-city-textedit',
														selectors: {
															wrapEl: '#init-city-textedit'
														},
														classes: {
															wrapClassName: ['textedit-right']
														},
														items: [
															{
																className: 'Terrasoft.ComboBoxEdit',
																value: {
																	bindTo: 'initCity'
																},
																enabled: false
															}
														]
													}
												]
											},
											{
												className: 'Terrasoft.Label',
												classes: {
													labelClass: ['labelEdit']
												},
												caption: resources.localizableStrings.FacebookValueCaption,
												visible: {
													bindTo: 'FacebookCity',
													bindConfig: {
														converter: function(value) {
															return value != '';
														}
													}
												}
											},
											{
												className: 'Terrasoft.Container',
												id: 'facebookCityContainer',
												selectors: {
													wrapEl: '#facebookCityContainer'
												},
												classes: {
													wrapClassName: ['container-spacing']
												},
												items: [
													{
														className: 'Terrasoft.Container',
														id: 'facebook-city-textedit',
														selectors: {
															wrapEl: '#facebook-city-textedit'
														},
														classes: {
															wrapClassName: ['textedit-right']
														},
														items: [
															{
																className: 'Terrasoft.TextEdit',
																value: {
																	bindTo: 'FacebookCity'
																},
																visible: {
																	bindTo: 'FacebookCity',
																	bindConfig: {
																		converter: function(value) {
																			return value != '';
																		}
																	}
																},
																enabled: false
															}
														]
													}
												]
											},
											/**
											* Блок, отвечающий за интеграцию с LinkedIn
											*/
//											{
//												className: 'Terrasoft.Label',
//												classes: {
//													labelClass: ['labelEdit']
//												},
//												caption: resources.localizableStrings.LinkedInValueCaption,
//												visible: {
//													bindTo: 'LinkedInCity',
//													bindConfig: {
//														converter: function(value) {
//															return value != '';
//														}
//													}
//												}
//											},
											/**
											* Блок, отвечающий за интеграцию с LinkedIn
											*/
//											{
//												className: 'Terrasoft.Container',
//												id: 'linkedInCityContainer',
//												selectors: {
//													wrapEl: '#linkedInCityContainer'
//												},
//												classes: {
//													wrapClassName: ['container-spacing']
//												},
//												items: [
//													{
//														className: 'Terrasoft.Container',
//														id: 'linkedIn-city-textedit',
//														selectors: {
//															wrapEl: '#linkedIn-city-textedit'
//														},
//														classes: {
//															wrapClassName: ['textedit-right']
//														},
//														items: [
//															{
//																className: 'Terrasoft.TextEdit',
//																value: {
//																	bindTo: 'LinkedInCity'
//																},
//																visible: {
//																	bindTo: 'LinkedInCity',
//																	bindConfig: {
//																		converter: function(value) {
//																			return value != '';
//																		}
//																	}
//																},
//																enabled: false
//															}
//														]
//													}
//												]
//											},
											{
												className: 'Terrasoft.Label',
												classes: {
													labelClass: ['labelEdit']
												},
												caption: resources.localizableStrings.TwitterValueCaption,
												visible: {
													bindTo: 'TwitterCity',
													bindConfig: {
														converter: function(value) {
															return value != '';
														}
													}
												}
											},
											{
												className: 'Terrasoft.Container',
												id: 'twitterCityContainer',
												selectors: {
													wrapEl: '#twitterCityContainer'
												},
												classes: {
													wrapClassName: ['container-spacing']
												},
												items: [
													{
														className: 'Terrasoft.Container',
														id: 'twitter-city-textedit',
														selectors: {
															wrapEl: '#twitter-city-textedit'
														},
														classes: {
															wrapClassName: ['textedit-right']
														},
														items: [
															{
																className: 'Terrasoft.TextEdit',
																value: {
																	bindTo: 'TwitterCity'
																},
																visible: {
																	bindTo: 'TwitterCity',
																	bindConfig: {
																		converter: function(value) {
																			return value != '';
																		}
																	}
																},
																enabled: false
															}
														]
													}
												]
											}
										]
									}
								]
							}
						]
					},
					{
						className: 'Terrasoft.Label',
						classes: {
							labelClass: ['labelEdit']
						},
						caption: resources.localizableStrings.AccountCaption,
						visible: {
							bindTo: 'isAccountContainerVisible'
						}
					},
					{
						className: 'Terrasoft.Container',
						id: 'accountContainer',
						classes: {
							wrapClassName: [
								'container-spacing',
								'table-row'
							]
						},
						selectors: {
							wrapEl: '#accountContainer'
						},
						visible: {
							bindTo: 'isAccountContainerVisible'
						},
						items: [
							{
								className: 'Terrasoft.Container',
								id: 'leftaccountContainer',
								classes: {
									wrapClassName: [
										'left-container',
										'table-cell'
									]
								},
								selectors: {
									wrapEl: '#leftaccountContainer'
								},
								items: [
									{
										className: 'Terrasoft.ComboBoxEdit',
										value: {
											bindTo: 'resultAccount'
										},
										list:{
											bindTo: 'accountList'
										},
										prepareList:{
											bindTo: 'getAccountList'
										}
									}
								]
							},
							{
								className: 'Terrasoft.Container',
								id: 'rightaccountContainer',
								classes: {
									wrapClassName: [
										'right-container',
										'table-cell'
									]
								},
								selectors: {
									wrapEl: '#rightaccountContainer'
								},
								items: [
									{
										className: 'Terrasoft.ControlGroup',
										id: 'accountControlGroup',
										selectors: {
											wrapEl: '#accountControlGroup'
										},
										collapsed: true,
										caption: resources.localizableStrings.AccountCaption,
										items: [
											{
												className: 'Terrasoft.Label',
												classes: {
													labelClass: ['labelEdit']
												},
												caption: resources.localizableStrings.CurrentValueCaption,
												visible: true
											},
											{
												className: 'Terrasoft.Container',
												id: 'initAccountContainer',
												selectors: {
													wrapEl: '#initAccountContainer'
												},
												classes: {
													wrapClassName: ['container-spacing']
												},
												items: [
													{
														className: 'Terrasoft.Container',
														id: 'init-account-textedit',
														selectors: {
															wrapEl: '#init-account-textedit'
														},
														classes: {
															wrapClassName: ['textedit-right']
														},
														items: [
															{
																className: 'Terrasoft.ComboBoxEdit',
																value: {
																	bindTo: 'initAccount'
																},
																enabled: false
															}
														]
													}
												]
											},
											{
												className: 'Terrasoft.Label',
												classes: {
													labelClass: ['labelEdit']
												},
												caption: resources.localizableStrings.FacebookValueCaption,
												visible: {
													bindTo: 'FacebookAccount',
													bindConfig: {
														converter: function(value) {
															return value != '';
														}
													}
												}
											},
											{
												className: 'Terrasoft.Container',
												id: 'facebookAccountContainer',
												selectors: {
													wrapEl: '#facebookAccountContainer'
												},
												classes: {
													wrapClassName: ['container-spacing']
												},
												items: [
													{
														className: 'Terrasoft.Container',
														id: 'facebook-account-textedit',
														selectors: {
															wrapEl: '#facebook-account-textedit'
														},
														classes: {
															wrapClassName: ['textedit-right']
														},
														items: [
															{
																className: 'Terrasoft.TextEdit',
																value: {
																	bindTo: 'FacebookAccount'
																},
																visible: {
																	bindTo: 'FacebookAccount',
																	bindConfig: {
																		converter: function(value) {
																			return value != '';
																		}
																	}
																},
																enabled: false
															}
														]
													}
												]
											},
											/**
											* Блок, отвечающий за интеграцию с LinkedIn
											*/
//											{
//												className: 'Terrasoft.Label',
//												classes: {
//													labelClass: ['labelEdit']
//												},
//												caption: resources.localizableStrings.LinkedInValueCaption,
//												visible: {
//													bindTo: 'LinkedInAccount',
//													bindConfig: {
//														converter: function(value) {
//															return value != '';
//														}
//													}
//												}
//											},
											/**
											* Блок, отвечающий за интеграцию с LinkedIn
											*/
//											{
//												className: 'Terrasoft.Container',
//												id: 'linkedInAccountContainer',
//												selectors: {
//													wrapEl: '#linkedInAccountContainer'
//												},
//												classes: {
//													wrapClassName: ['container-spacing']
//												},
//												items: [
//													{
//														className: 'Terrasoft.Container',
//														id: 'linkedIn-account-textedit',
//														selectors: {
//															wrapEl: '#linkedIn-account-textedit'
//														},
//														classes: {
//															wrapClassName: ['textedit-right']
//														},
//														items: [
//															{
//																className: 'Terrasoft.TextEdit',
//																value: {
//																	bindTo: 'LinkedInAccount'
//																},
//																visible: {
//																	bindTo: 'LinkedInAccount',
//																	bindConfig: {
//																		converter: function(value) {
//																			return value != '';
//																		}
//																	}
//																},
//																enabled: false
//															}
//														]
//													}
//												]
//											},
											{
												className: 'Terrasoft.Label',
												classes: {
													labelClass: ['labelEdit']
												},
												caption: resources.localizableStrings.TwitterValueCaption,
												visible: {
													bindTo: 'TwitterAccount',
													bindConfig: {
														converter: function(value) {
															return value != '';
														}
													}
												}
											},
											{
												className: 'Terrasoft.Container',
												id: 'twitterAccountContainer',
												selectors: {
													wrapEl: '#twitterAccountContainer'
												},
												classes: {
													wrapClassName: ['container-spacing']
												},
												items: [
													{
														className: 'Terrasoft.Container',
														id: 'twitter-account-textedit',
														selectors: {
															wrapEl: '#twitter-account-textedit'
														},
														classes: {
															wrapClassName: ['textedit-right']
														},
														items: [
															{
																className: 'Terrasoft.TextEdit',
																value: {
																	bindTo: 'TwitterAccount'
																},
																visible: {
																	bindTo: 'TwitterAccount',
																	bindConfig: {
																		converter: function(value) {
																			return value != '';
																		}
																	}
																},
																enabled: false
															}
														]
													}
												]
											}
										]
									}
								]
							}
						]
					}
				]
			});
			return container;
		}

		function getViewModel() {
			return Ext.create('Terrasoft.BaseViewModel', {
				values: {
					columnNames: ['Name', 'Email'],
					activeRowId: null,
					recordId: '',
					FacebookId: '',
					TwitterId: '',
//					// Блок, отвечающий за интеграцию с LinkedIn
//					LinkedInId: '',
					//Name
					resultName: '',
					initName: '',
					FacebookName: '',
					// Блок, отвечающий за интеграцию с LinkedIn
//					LinkedInName: '',
					TwitterName: '',
					defNameTag: 'initName',
					resultEmail: '',
					initEmail: '',
					FacebookEmail: '',
					// Блок, отвечающий за интеграцию с LinkedIn
//					LinkedInEmail: '',
					TwitterEmail: '',
					defEmailTag: 'initEmail',
					resultPhone: '',
					initPhone: '',
					FacebookPhone: '',
					// Блок, отвечающий за интеграцию с LinkedIn
//					LinkedInPhone: '',
					TwitterPhone: '',
					defPhoneTag: 'initPhone',
					resultSkype: '',
					initSkype: '',
					FacebookSkype: '',
					// Блок, отвечающий за интеграцию с LinkedIn
//					LinkedInSkype: '',
					TwitterSkype: '',
					defSkypeTag: 'initSkype',
					resultBirthDate: '',
					initBirthDate: '',
					FacebookBirthDate: '',
					// Блок, отвечающий за интеграцию с LinkedIn
//					LinkedInBirthDate: '',
					TwitterBirthDatee: '',
					defBirthDateTag: 'initBirthDate',
					resultJobTitle: '',
					initJobTitle: '',
					FacebookJobTitle: '',
					// Блок, отвечающий за интеграцию с LinkedIn
//					LinkedInJobTitle: '',
					TwitterJobTitle: '',
					defJobTitleTag: 'initJobTitle',
					resultAddress: '',
					initAddress: '',
					FacebookAddress: '',
					// Блок, отвечающий за интеграцию с LinkedIn
//					LinkedInAddress: '',
					TwitterAddress: '',
					defAddressTag: 'initAddress',
					resultNotes: '',
					initNotes: '',
					FacebookNotes: '',
					// Блок, отвечающий за интеграцию с LinkedIn
//					LinkedInNotes: '',
					TwitterNotes: '',
					defNotesTag: 'initNotes',
					resultCity: '',
					initCity: '',
					FacebookCity: '',
					// Блок, отвечающий за интеграцию с LinkedIn
//					LinkedInCity: '',
					TwitterCity: '',
					defCityTag: 'initCity',
					resultAccount: '',
					initAccount: '',
					FacebookAccount: '',
					// Блок, отвечающий за интеграцию с LinkedIn
//					LinkedInAccount: '',
					TwitterAccount: '',
					defAccountTag: 'initAccount',
					resultCountry: null,
					initCountry: null,
					FacebookCountry: null,
					// Блок, отвечающий за интеграцию с LinkedIn
//					LinkedInCountry: null,
					TwitterCountry: null,
					defCountryTag: 'initCountry',
					resultGender: '',
					initGender: '',
					FacebookGender: '',
					// Блок, отвечающий за интеграцию с LinkedIn
//					LinkedInGender: '',
					TwitterGender: '',
					defGenderTag: 'initGender',
					genderList: new Terrasoft.Collection(),
					countryList: new Terrasoft.Collection(),
					cityList: new Terrasoft.Collection(),
					accountList: new Terrasoft.Collection()
				},
				methods: {
					getGenderList: function(filter, list) {
						fillListBySchemaName(list, 'Gender');
					},
					getCountryList: function(filter, list) {
						fillListBySchemaName(list, 'Country');
					},
					getCityList: function(filter, list) {
						fillListBySchemaName(list, 'City');
					},
					getAccountList: function(filter, list) {
						fillListBySchemaName(list, 'Account');
					},
					onOKButtonClick: function() {
						updateContact(this);
						sandbox.publish('OpenLookupPage', null, [sandbox.id]);
						sandbox.publish('BackHistoryState');
					},
					onCancelButtonClick: function() {
						sandbox.publish('BackHistoryState');
					},
					getSocialNetworkUserProfile: function(socialNetwork, socialAccountId) {
						var dataSend = {
							socialNetworkName: socialNetwork,
							socialAccountId: socialAccountId
						};
						scope = this;
						var ajaxProvider = Terrasoft.AjaxProvider;
						callServiceMethod(ajaxProvider, 'GetSocialProfile', function(response) {
							var responseData = Ext.decode(response.GetSocialProfileResult);
							var exeptionNetworks = responseData.exeptionNetworks;
							var accessTokenExNetworks = responseData.accessTokenExNetworks;
							if (exeptionNetworks != undefined && exeptionNetworks != '' && exeptionNetworks != 'None') {
								scope.showInformationDialog(resources.localizableStrings.SocialNetworkError
									+ exeptionNetworks);
							}
							if (accessTokenExNetworks != undefined && accessTokenExNetworks != '' && accessTokenExNetworks != 'None') {
								ShowAuthInformationDialog(scope, accessTokenExNetworks, resources.localizableStrings.SocialNetworkAuthError);
							}
							fillSocialAccountProfileControls(socialNetwork, scope, responseData);
						}, dataSend);
					},
					getContactInitData: function(contactId) {
						selectContactInitData(this, contactId);
					},
					isNameContainerVisible: function() {
						return isContainerVisible(this, 'Name');
					},
					isSkypeContainerVisible: function() {
						return isContainerVisible(this, 'Skype');
					},
					isEmailContainerVisible: function() {
						return isContainerVisible(this, 'Email');
					},
					isPhoneContainerVisible: function() {
						return isContainerVisible(this, 'Phone');
					},
					isBirthDateContainerVisible: function() {
						return isContainerVisible(this, 'BirthDate');
					},
					isNotesContainerVisible: function() {
						return isContainerVisible(this, 'Notes');
					},
					isJobTitleContainerVisible: function() {
						return isContainerVisible(this, 'JobTitle');
					},
					isAddressContainerVisible: function() {
						return isContainerVisible(this, 'Address');
					},
					isGenderContainerVisible: function() {
						return isContainerVisible(this, 'Gender');
					},
					isCountryContainerVisible: function() {
						return isContainerVisible(this, 'Country');
					},
					isCityContainerVisible: function() {
						return isContainerVisible(this, 'City');
					},
					isAccountContainerVisible: function() {
						return isContainerVisible(this, 'Account');
					},
					rereadSocialData: function(viewModel){
						readSocialData(viewModel);
					}
				}
			});
		}

		function fillListBySchemaName(list, schemaName) {
			list.clear();
			var select = Ext.create('Terrasoft.EntitySchemaQuery', {
				rootSchemaName: schemaName
			});
			select.addColumn('Id');
			select.addColumn('Name');
			select.getEntityCollection(function(response) {
				var entities = response.collection.getItems();
				var items = {};
				Terrasoft.each(entities, function(entity) {
					var primaryValue = entity.get('Id');
					var primaryDisplayValue = entity.get('Name');
					items[primaryValue] = {
						value: primaryValue,
						displayValue: primaryDisplayValue
					};
				});
				list.loadAll(items)
			}, this);
		}

		function isContainerVisible(scope, fieldName) {
			return (scope.get('Facebook' + fieldName) != '' && scope.get('Facebook' + fieldName) != null)
				|| (scope.get('Twitter' + fieldName) != '' && scope.get('Twitter' + fieldName) != null)
				// Блок, отвечающий за интеграцию с LinkedIn
//				|| (scope.get('LinkedIn' + fieldName) != '' && scope.get('LinkedIn' + fieldName) != null)
		}

		function updateContact(scope) {
			var update = Ext.create('Terrasoft.UpdateQuery', {
				rootSchemaName: 'Contact'
			});
			update.filters.add('ContactIdFilter',
				update.createColumnFilterWithParameter(
					Terrasoft.ComparisonType.EQUAL, 'Id', scope.get('recordId')));
			update.setParameterValue('Name', scope.get('resultName'), Terrasoft.DataValueType.TEXT);
			update.setParameterValue('Email', scope.get('resultEmail'), Terrasoft.DataValueType.TEXT);
			update.setParameterValue('Phone', scope.get('resultPhone'), Terrasoft.DataValueType.TEXT);
			update.setParameterValue('Skype', scope.get('resultSkype'), Terrasoft.DataValueType.TEXT);
			update.setParameterValue('BirthDate', scope.get('resultBirthDate'), Terrasoft.DataValueType.DATE);
			update.setParameterValue('JobTitle', scope.get('resultJobTitle'), Terrasoft.DataValueType.TEXT);
			update.setParameterValue('Address', scope.get('resultAddress'), Terrasoft.DataValueType.TEXT);
			update.setParameterValue('Notes', scope.get('resultNotes'), Terrasoft.DataValueType.TEXT);
			update.setParameterValue('Country', scope.get('resultCountry').value, Terrasoft.DataValueType.LOOKUP);
			update.setParameterValue('Gender', scope.get('resultGender').value, Terrasoft.DataValueType.LOOKUP);
			update.setParameterValue('City', scope.get('resultCity').value, Terrasoft.DataValueType.LOOKUP);
			update.setParameterValue('Account', scope.get('resultAccount').value, Terrasoft.DataValueType.LOOKUP);
			update.execute();
		}

		function selectContactInitData(scope, contactId) {
			var select = Ext.create('Terrasoft.EntitySchemaQuery', {
				rootSchemaName: 'Contact'
			});
			select.addColumn('Id');
			select.addColumn('Name');
			select.addColumn('Email');
			select.addColumn('Phone');
			select.addColumn('Skype');
			select.addColumn('BirthDate');
			select.addColumn('JobTitle');
			select.addColumn('Address');
			select.addColumn('Notes');
			select.addColumn('Country.Id', 'CountryId');
			select.addColumn('Country.Name', 'CountryName');
			select.addColumn('Gender.Id', 'GenderId');
			select.addColumn('Gender.Name', 'GenderName');
			select.addColumn('City.Id', 'CityId');
			select.addColumn('City.Name', 'CityName');
			select.addColumn('Account.Id', 'AccountId');
			select.addColumn('Account.Name', 'AccountName');
			var filters = Ext.create('Terrasoft.FilterGroup');
			filters.addItem(select.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
				'Id', contactId));
			select.filters = filters;
			select.getEntityCollection(function(result) {
				var collection = result.collection;
				if (!Ext.isEmpty(collection)) {
					var itemValues = collection.collection.items[0].values;
					scope.set('initName', itemValues.Name);
					scope.set('initEmail', itemValues.Email);
					scope.set('initPhone', itemValues.Phone);
					scope.set('initSkype', itemValues.Skype);
					scope.set('initBirthDate', itemValues.BirthDate);
					scope.set('initJobTitle', itemValues.JobTitle);
					scope.set('initAddress', itemValues.Address);
					scope.set('initNotes', itemValues.Notes);
					scope.set('initCountry', {
						value: itemValues.CountryId == '' ? null : itemValues.CountryId,
						displayValue: itemValues.CountryName
					});
					scope.set('initGender', {
						value: itemValues.GenderId == '' ? null : itemValues.GenderId,
						displayValue: itemValues.GenderName
					});
					scope.set('initCity', {
						value: itemValues.CityId == '' ? null : itemValues.CityId,
						displayValue: itemValues.CityName
					});
					scope.set('initAccount', {
						value: itemValues.AccountId == '' ? null : itemValues.AccountId,
						displayValue: itemValues.AccountName
					});
					scope.fireEvent('dataLoaded');
				}
			}, this);
		}

		function fillSocialAccountProfileControls(socialNetwork, scope, response) {
			Terrasoft.each(response, function(value, key) {
				if (value != null) {
					switch (key) {
						case 'AboutMe':
							scope.set('Notes', value);
							break;
						case 'ProdileId':
							scope.set(socialNetwork + 'Id', value);
							break;
						case 'JobTitle':
							scope.set(socialNetwork + 'JobTitle', value);
							scope.set(socialNetwork + 'Account', value);
							break;
						default:
							scope.set(socialNetwork + key, value);
					}
				}
			});
		}

		function ShowAuthInformationDialog(scope, networks, message) {
			if (networks == undefined || networks == '') {
				return;
			}
			if (networks == 'All') {
				// Блок, отвечающий за интеграцию с LinkedIn
//				networks = 'Facebook, Twitter, LinkedIn';
				networks = "Facebook, Twitter";
			}
			var socialNetwork = networks.split(', ')[0];
			var cfg = {
				style: Terrasoft.MessageBoxStyles.BLUE
			};
			scope.showConfirmationDialog(
				message + socialNetwork, function getSelectedButton(returnCode) {
					if (returnCode === Terrasoft.MessageBoxButtons.YES.returnCode) {
						OpenSocialNetworkAuthWindow(socialNetwork, scope);
					}
				}, ['yes', 'no'], cfg);
		}

		function OpenSocialNetworkAuthWindow(socialNetwork, scope) {
			SocialAccountAuthUtilities.checkSysSettingsAndOpenWindow(socialNetwork, sandbox, function () {
				scope.rereadSocialData(viewModel);
			});
		}

		function callServiceMethod(ajaxProvider, methodName, callback, dataSend) {
			var provider = ajaxProvider;
			var data = dataSend || {};
			var requestUrl = Terrasoft.workspaceBaseUrl + '/rest/GetSocialProfileService/' + methodName;
			provider.request({
				url: requestUrl,
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				method: 'POST',
				jsonData: data,
				callback: function(request, success, response) {
					var responseObject = {};
					if (success) {
						responseObject = Terrasoft.decode(response.responseText);
					}
					callback.call(this, responseObject);
				},
				scope: this
			});
		}

		function init() {

		}

		function initSocialNetworkdIds(viewModel) {
			var historyState = sandbox.publish('GetHistoryState');
			if (historyState.state != null) {
				var state = historyState.state;
				viewModel.set('FacebookId', state.FacebookId);
				// Блок, отвечающий за интеграцию с LinkedIn
//				viewModel.set('LinkedInId', state.LinkedInId);
				viewModel.set('TwitterId', state.TwitterId);
				viewModel.set('recordId', state.ContactId);
			}
		}

		function subscribeForRadioButtonChange(viewModel) {
			viewModel.on('change:defNameTag', function(model, tag) {
				this.set('resultName', this.get(tag));
			}, viewModel);
			viewModel.on('change:defPhoneTag', function(model, tag) {
				this.set('resultPhone', this.get(tag));
			}, viewModel);
			viewModel.on('change:defEmailTag', function(model, tag) {
				this.set('resultEmail', this.get(tag));
			}, viewModel);
			viewModel.on('change:defSkypeTag', function(model, tag) {
				this.set('resultSkype', this.get(tag));
			}, viewModel);
			viewModel.on('change:defBirthDateTag', function(model, tag) {
				this.set('resultBirthDate', this.get(tag));
			}, viewModel);
			viewModel.on('change:defJobTitleTag', function(model, tag) {
				this.set('resultJobTitle', this.get(tag));
			}, viewModel);
			viewModel.on('change:defNotesTag', function(model, tag) {
				this.set('resultNotes', this.get(tag));
			}, viewModel);
			viewModel.on('change:defAddressTag', function(model, tag) {
				this.set('resultAddress', this.get(tag));
			}, viewModel);
		}

		function readSocialData(viewModel){
			var facebookId = viewModel.get('FacebookId');
			if (facebookId != '') {
				viewModel.getSocialNetworkUserProfile('Facebook', facebookId);
			}
			// Блок, отвечающий за интеграцию с LinkedIn
//			var linkedInId = viewModel.get('LinkedInId');
//			if (linkedInId != '') {
//				viewModel.getSocialNetworkUserProfile('LinkedIn', linkedInId);
//			}
			var twitterId = viewModel.get('TwitterId');
			if (twitterId != '') {
				viewModel.getSocialNetworkUserProfile('Twitter', twitterId);
			}
			viewModel.getContactInitData(viewModel.get('recordId'));
		}

		function render(renderTo) {
			var headerCaption = resources.localizableStrings.WindowCaption;
			sandbox.publish("ChangeHeaderCaption", {
				caption: headerCaption,
				dataViews: new Terrasoft.Collection()
			});
			sandbox.subscribe("NeedHeaderCaption", function() {
				sandbox.publish("InitDataViews", { caption: headerCaption });
			}, this);
			viewModel = getViewModel();
			initSocialNetworkdIds(viewModel);
			subscribeForRadioButtonChange(viewModel);
			view = getView();
			view.bind(viewModel);
			view.render(renderTo);
			viewModel.addEvents('dataLoaded');
			viewModel.on('dataLoaded', function() {
				viewModel.set('resultName', viewModel.get('initName'));
				viewModel.set('resultPhone', viewModel.get('initPhone'));
				viewModel.set('resultEmail', viewModel.get('initEmail'));
				viewModel.set('resultSkype', viewModel.get('initSkype'));
				viewModel.set('resultBirthDate', viewModel.get('initBirthDate'));
				viewModel.set('resultJobTitle', viewModel.get('initJobTitle'));
				viewModel.set('resultNotes', viewModel.get('initNotes'));
				viewModel.set('resultAddress', viewModel.get('initAddress'));
				viewModel.set('resultGender', viewModel.get('initGender'));
				viewModel.set('resultCountry', viewModel.get('initCountry'));
				viewModel.set('resultCity', viewModel.get('initCity'));
				viewModel.set('resultAccount', viewModel.get('initAccount'));
			});
			readSocialData(viewModel);
		}

		return {
			init: init,
			render: render
		};
	});
