export interface Friend {
	title: string;
	url: string;
	description?: string;
	avatar?: string;
}

export const insights: Friend[] = [
	{
		title: "上海交通大学生存手册",
		description: "真正的大学生第一课",
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
		avatar: "https://avatars.githubusercontent.com/u/51155451?v=4",
		description: "A mysterious developer.",
	},
	{
		title: "VaalaCat",
		avatar: "https://avatars.githubusercontent.com/u/42285362?v=4",
		url: "https://vaala.cat/",
		description: "菜猫"
	},
	{
		title: "Saurlax",
		url: "https://saurlax.com/",
		avatar: "https://saurlax.com/avatar.jpg",
		description: "Web, IoT, ML, Cybersecurity, Quantum and Graphics developer"
	},
	{
		title: "寅默",
		url: "https://blog.yinmo19.top/",
		avatar: "https://avatars.githubusercontent.com/u/144041694?v=4",
		description: "Rust, ARM ASM, and Mac."
	},
	{
		title: "BBB",
		url: "https://dingbangliu.codeberg.page/",
		avatar: "/linkx/BBB.jpg",
		description: "Combats avec te défenseurs !"
	},
	{	
		title: "Kokoro",
		url: "blog.kokoro2336.site",
		avatar: "https://avatars.githubusercontent.com/u/136730884?v=4",
		description: "Never give up control.",
	}
];

export const communities: Friend[] = [
	{
		title: "HITSZ 课程攻略共享计划",
		description: "一份全面的课程攻略 欢迎关注!",
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
		description: "HITSZ 开源技术协会",
		avatar: "/linkx/OSA.svg",
	}
];
