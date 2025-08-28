export interface Friend {
	title: string;
	url: string;
	description: string;
	avatar?: string;
}

export const insights: Friend[] = [
	{
		title: "上海交通大学生存手册",
		description: "真正的大学生第一课。另可以找到<strong>免费</strong>的 PDF 版本。",
		url: "https://survivesjtu.gitbook.io/survivesjtumanual",
	},
	{
		title: "中文文案排版指北",
		description: "提升中文内容可读性",
		url: "https://github.com/sparanoid/chinese-copywriting-guidelines/blob/master/README.zh-Hans.md",
	},
];

export const friends: Friend[] = [
	{
		title: "cclvi256",
		avatar: "/icon.ico",
		url: "https://cclvi.cc/",
		description: "",
	},
	{
		title: "VaalaCat",
		avatar: "https://vaala.cat/images/blog/avatar.png",
		url: "https://vaala.cat/",
		description: "",
	},
	{
		title: "寅默",
		url: "https://blog.yinmo19.top/",
		description: "",
	},
	{
		title: "Saurlax",
		url: "https://saurlax.com/",
		description: "建站导师",
	},
];

export const communities: Friend[] = [
	{
		title: "HITSZ 自动化课程攻略共享计划",
		description: "",
		avatar: "https://hoa.moe/images/logo.webp",
		url: "https://hoa.moe/",
	},
];
