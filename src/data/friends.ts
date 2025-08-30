export interface Friend {
	title: string;
	url: string;
	description?: string;
	avatar?: string;
}

export const insights: Friend[] = [
	{
		title: "上海交通大学生存手册",
		description: "真正的大学生第一课。另可找到<strong>免费</strong> PDF 版本。",
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
		url: "https://cclvi.cc/",
		avatar: "/linkx/cclvi256.jpg",
	},
	{
		title: "VaalaCat",
		avatar: "/linkx/vaalacat.jpg",
		url: "https://vaala.cat/",
	},
	{
		title: "寅默",
		url: "https://blog.yinmo19.top/",
		avatar: "/linkx/yinmo.jpg",
	},
	{
		title: "Saurlax",
		url: "https://saurlax.com/",
		avatar: "/linkx/saurlax.jpg",
	},
	{
		title: "BBB",
		url: "https://dingbangliu.codeberg.page/",
		avatar: "/linkx/bbb.jpg",
	},
	{	
		title: "Kokoro",
		url: "https://github.com/Kokoro2336",
		avatar: "/linkx/Kokoro.jpg",
	}
];

export const communities: Friend[] = [
	{
		title: "HITSZ 自动化课程攻略共享计划",
		description: "一份全面的课程攻略，同时包含计算机专业内容。<br>欢迎关注支持！",
		avatar: "https://hoa.moe/images/logo.webp",
		url: "https://hoa.moe/",
	},
	{
		title: "SYSU-SAA-Survival-Manual",
		description: "中山大学航空航天学院生存手册",
		avatar: "/linkx/SYSU-SAA.png",
		url: "https://yigebande.github.io/SYSU-SAA-Survival-Manual/",
	},
	{
		url: "https://osa.moe/",
		title: "HITSZ OSA",
		description: "a.k.a Open Source Association<br>HITSZ 开源技术协会",
		avatar: "/linkx/OSA.svg",
	}
];
