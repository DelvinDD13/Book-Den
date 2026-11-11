// ===== L49: Encyclopedia data — Dungeon Crawler Carl. d1 … d8 = books 1 to 8; book:0 = started, a bare key = finished.
// He has finished all eight, so everything here is open for him; the gates still follow the book each fact comes from.
// Facts are checked against the pages in src (SuperSummary character lists for books 2–8 and the book 1 summary, TV Tropes,
// Audible's series explainer). Where two pages disagree, the fact is left out.
(function () { if (!window.L29) return;
  L29.add({ k: 'dcc', n: 'Dungeon Crawler Carl', short: 'DCC', world: 'Earth', by: 'Matt Dinniman', skin: 'pixel', spines: ['#2b1d4f', '#d4a017', '#8b1e3f', '#1f6f5c', '#3a3f8f'], acc: '#ffd23f', hue: ['#1a0b2e', '#07040c'], badge: 'Down the Stairwell',
    about: [['', "Every building on Earth falls at once and kills everyone inside. The survivors can stay outside in the cold or go down the stairwells into the World Dungeon, eighteen floors run as a game show for the rest of the galaxy. Whoever beats the eighteenth floor is promised rule of Earth."]],
    src: [['SuperSummary, Dungeon Crawler Carl summary', 'https://supersummary.com/dungeon-crawler-carl/summary'], ["SuperSummary, Carl's Doomsday Scenario characters", 'https://www.supersummary.com/carls-doomsday-scenario/character-list/'],
      ["SuperSummary, The Dungeon Anarchist's Cookbook characters", 'https://www.supersummary.com/the-dungeon-anarchists-cookbook/character-list/'], ['SuperSummary, The Gate of the Feral Gods characters', 'https://www.supersummary.com/the-gate-of-the-feral-gods/character-list/'],
      ["SuperSummary, The Butcher's Masquerade characters", 'https://www.supersummary.com/the-butchers-masquerade/character-list/'], ['SuperSummary, The Eye of the Bedlam Bride characters', 'https://www.supersummary.com/the-eye-of-the-bedlam-bride/character-list/'],
      ['SuperSummary, This Inevitable Ruin characters', 'https://www.supersummary.com/this-inevitable-ruin/character-list/'], ['SuperSummary, A Parade of Horribles characters', 'https://www.supersummary.com/a-parade-of-horribles/character-list/'],
      ['TV Tropes, Dungeon Crawler Carl', 'https://tvtropes.org/pmwiki/pmwiki.php/Literature/DungeonCrawlerCarl'], ['Audible, Dungeon Crawler Carl explained', 'https://www.audible.com/blog/article-dungeon-crawler-carl-explained']],
    books: [
      { k: 'd1', t: 'Dungeon Crawler Carl', sp: 'Dungeon Crawler Carl', m: '^Dungeon Crawler Carl' },
      { k: 'd2', t: "Carl's Doomsday Scenario", sp: 'Doomsday Scenario', m: "^Carl.s Doomsday Scenario" },
      { k: 'd3', t: "The Dungeon Anarchist's Cookbook", sp: "Anarchist's Cookbook", m: "^The Dungeon Anarchist.s Cookbook" },
      { k: 'd4', t: 'The Gate of the Feral Gods', sp: 'Feral Gods', m: '^The Gate of the Feral Gods' },
      { k: 'd5', t: "The Butcher's Masquerade", sp: "Butcher's Masquerade", m: "^The Butcher.s Masquerade" },
      { k: 'd6', t: 'The Eye of the Bedlam Bride', sp: 'Bedlam Bride', m: '^The Eye of the Bedlam Bride' },
      { k: 'd7', t: 'This Inevitable Ruin', sp: 'Inevitable Ruin', m: '^This Inevitable Ruin' },
      { k: 'd8', t: 'A Parade of Horribles', sp: 'Parade of Horribles', m: '^A Parade of Horribles' }],
    cats: { crawlers: 'Crawlers', guides: 'Guides & hosts', npcs: 'People of the dungeon', rules: 'Rules of the game', places: 'Floors & places', lore: 'The show & the Syndicate' },
    e: [
      // ---------- crawlers ----------
      { id: 'carl', n: 'Carl', c: 'crawlers', o: 1, g: 'd1:0', t: [['d1:0', 'Crawler'], ['d7', 'Co-warlord of the Princess Posse']], rel: ['donut', 'mongo', 'mordecai', 'katia', 'bea', 'zev', 'gods'], s: [
        ['d1:0', "Twenty-seven, a Coast Guard veteran and marine technician from Seattle. He was outside chasing Princess Donut, his ex-girlfriend Beatrice's cat, when the buildings came down, and he went into the dungeon with her to get out of the cold. He fights in a leather coat, boxers and Beatrice's pink Crocs."],
        ['d1', "He works with traps and explosives, and the recaps often show him as a dangerous bomber."],
        ['d2', "His race is Primal and his class is Compensated Anarchist."],
        ['d5', "On the sixth floor his class is Agent Provocateur."],
        ['d6', "He follows the god Emberus. Memories of his stepmother, Tami-Lynn, and his younger half-brother, Asher, come back to him as constructs."],
        ['d7', "He and Donut lead the Princess Posse as co-warlords. Shi Maria lives inside him as a parasite."],
        ['d8', "A Naga lawyer, Princess Chandra, makes him her husband against his will."]] },
      { id: 'donut', n: 'Princess Donut', c: 'crawlers', o: 2, g: 'd1:0', t: [['d1:0', 'Crawler, a Persian show cat']], rel: ['carl', 'mongo', 'mordecai', 'katia', 'bea', 'lucia', 'prepotente'], s: [
        ['d1:0', "Beatrice's long-haired Persian show cat. She jumped out a window as the buildings fell, and Carl went after her. In the dungeon she eats an enhanced pet biscuit and starts to talk and think like a person. Her charisma is very high."],
        ['d1', "The game puts her in line for the throne of the Blood Sultanate."],
        ['d2', "Her class is Former Child Actor."],
        ['d3', "Princess D'nadia sponsors her."],
        ['d5', "On the sixth floor she is a Legendary Diva, a bard."],
        ['d7', "She leads the Princess Posse with Carl."],
        ['d8', "Her class is Assassin of Sekhmet. She takes Prepotente under her wing, and Princess Chandra is her opponent in law."]] },
      { id: 'mongo', n: 'Mongo', c: 'crawlers', o: 3, g: 'd1:0', t: [['d1:0', "Donut's velociraptor"]], rel: ['donut', 'carl'], s: [
        ['d1:0', "A baby velociraptor. Donut names him, and he bonds with her."],
        ['d3', "By the fourth floor he is the size of a pony, and Donut rides him into fights."],
        ['d5', "He takes a mate, Kiwi, a level 60 mongoliensis velociraptor who leads a wild pack. Kiwi's daughter is Big Tina, a huge dinosaur in a pink feather boa."]] },
      { id: 'katia', n: 'Katia Grim', c: 'crawlers', o: 4, g: 'd2', t: [['d2', 'Crawler, doppelganger']], rel: ['carl', 'donut', 'hekla', 'eva', 'bautista', 'mordecai'], s: [
        ['d2', "She came into the dungeon in Hekla's party. She is a doppelganger, a shapeshifter, and her class is Monster Truck Driver. She joins Carl and Donut."],
        ['d3', "She holds the front for the party as its tank. Princess Formidable sponsors her, and Mordecai takes her on."],
        ['d4', "She has lost her original form and works as the party's scout and infiltrator."],
        ['d5', "She keeps Carl's impulses in check and coordinates the allied crawlers."],
        ['d6', "Astrid, the Desperado Club's security chief, is her assassination target."],
        ['d7', "She and Bautista grow close."]] },
      { id: 'hekla', n: 'Hekla', c: 'crawlers', o: 5, g: 'd2', t: [['d2', "Leader of Brynhild's Daughters"]], rel: ['katia', 'eva', 'odette', 'carl'], s: [
        ['d2', "An Icelandic crawler of the Amazonian race, class Shieldmaiden. She leads an all-women party, Brynhild's Daughters, treats Carl as a rival and schemes against Donut."],
        ['d3', "She was a psychiatrist before the collapse. Odette sponsors her."]] },
      { id: 'eva', n: 'Eva Sigrid', c: 'crawlers', o: 6, g: 'd3', t: [['d3', "Hekla's enforcer"], ['d5', 'With the Dark Hive']], rel: ['hekla', 'katia', 'vrah'], s: [
        ['d3', "Four arms and a cobra's head. She is the enforcer in Hekla's party and is set against Katia."],
        ['d5', "Katia knew her before the collapse. She joins the Dark Hive and wears her victims' skulls."]] },
      { id: 'imani', n: 'Imani', c: 'crawlers', o: 7, g: 'd3', t: [['d3', 'Leads the Meadow Larks with Elle']], rel: ['elle', 'brandon', 'chris', 'carl'], s: [
        ['d3', "An Obsidian Butterfly. She and Elle lead the Meadow Larks, the crawlers from Brandon's retirement home, and on the fourth floor she looks into the train lines."],
        ['d8', "A healer. She keeps the allied crawlers steady, and Chris, Brandon's brother, is drawn to her."]] },
      { id: 'elle', n: 'Elle McGibbons', c: 'crawlers', o: 8, g: 'd3', t: [['d3', 'Frost Maiden']], rel: ['imani', 'carl'], s: [
        ['d3', "She was ninety-nine, living in the retirement home with dementia, when the dungeon took her. She became a Frost Maiden, an ice fairy."],
        ['d8', "She is still grieving her late husband."]] },
      { id: 'brandon', n: 'Brandon', c: 'crawlers', o: 9, g: 'd1', t: [['d1', 'Leader of Meadow Lark']], rel: ['chris', 'imani', 'carl'], s: [
        ['d1', "He led the Meadow Lark group and would not leave its elderly members behind."],
        ['d3', "He died on the third floor saving others. Chris is his brother."]] },
      { id: 'chris', n: 'Chris Andrews', c: 'crawlers', o: 10, g: 'd3', t: [['d3', 'Igneous']], rel: ['brandon', 'imani', 'carl'], s: [
        ['d3', "Brandon's estranged brother. He took the Igneous race, a rock monster, and went looking for Carl."],
        ['d4', "He worked maintenance at the retirement home before the collapse."],
        ['d8', "He races on the tenth floor."]] },
      { id: 'bautista', n: 'Daniel Bautista', c: 'crawlers', o: 11, g: 'd2', t: [['d2', 'Ally']], rel: ['carl', 'katia'], s: [
        ['d2', "He changed his look to a tiger's and becomes Carl's ally."],
        ['d3', "He leads a large group of crawlers he has rescued and works with Carl over the chat."],
        ['d7', "He and Katia grow close."]] },
      { id: 'louis', n: 'Louis Santiago', c: 'crawlers', o: 12, g: 'd4', t: [['d4', 'Crawler'], ['d7', 'Army Air General']], rel: ['firas', 'juicebox', 'samantha', 'carl', 'katia'], s: [
        ['d4', "He drove his convertible van into the collapse and so ended up in the dungeon. He follows Carl, not happily. His best friend is Firas. He and Juice Box fall for each other."],
        ['d5', "He flies a house called the Twister."],
        ['d7', "He is the Princess Posse's Army Air General, and he is married to Juice Box."]] },
      { id: 'firas', n: 'Firas', c: 'crawlers', o: 13, g: 'd4', t: [['d4', 'Crawler']], rel: ['louis'], s: [
        ['d4', "Louis's best friend. He would rather hide than fight, and he has a teleport spell, Puddle Jumper."]] },
      { id: 'lucia', n: 'Lucia Mar', c: 'crawlers', o: 14, g: 'd2', t: [['d2', 'Lajabless']], rel: ['donut', 'carl'], s: [
        ['d2', "A Lajabless, the most powerful crawler still alive. She threatens Donut."],
        ['d5', "She is a child, ranked near the top, and her mind is split."],
        ['d7', "Diah lives inside her. Carl protects her."]] },
      { id: 'prepotente', n: 'Prepotente', c: 'crawlers', o: 15, g: 'd5', t: [['d5', 'Profane Vitiate']], rel: ['miriam', 'donut', 'carl'], s: [
        ['d5', "A goat crawler, ranked high, class Profane Vitiate. He rides a winged familiar named Bianca. Miriam Dom adopted him."],
        ['d7', "He was a crawler's pet before he became a crawler himself."],
        ['d8', "Abrasive, awkward and lonely. Donut takes him under her wing."]] },
      { id: 'miriam', n: 'Miriam Dom', c: 'crawlers', o: 16, g: 'd5', t: [['d5', 'Crawler']], rel: ['prepotente', 'carl'], s: [
        ['d5', "A high-ranking crawler with a vampire infection. She raised Prepotente and sides with Carl."]] },
      { id: 'frankmaggie', n: 'Frank and Maggie', c: 'crawlers', o: 17, g: 'd1', t: [['d1', 'Crawlers']], rel: ['carl', 'skull'], s: [
        ['d1', "A couple who attack Carl. When one of his traps injures their daughter, Yvette, Maggie kills her."],
        ['d3', "Frank Q is broken by the dungeon and by guilt over it."],
        ['d4', "Frank is dead, and Maggie My wants revenge on Carl. The Skull Empire sponsors her."]] },
      { id: 'tserendolgor', n: 'Tserendolgor', c: 'crawlers', o: 18, g: 'd6', t: [['d6', 'Squad leader']], rel: ['carl', 'donut'], s: [
        ['d6', "A dog-woman crawler who leads a heavily armed squad. She and Carl respect each other as rivals; she and Donut were rivals too."]] },
      { id: 'quiteria', n: 'Sister Ines Quiteria', c: 'crawlers', o: 19, g: 'd6', t: [['d6', 'Poet Laureate']], rel: ['gods', 'carl'], s: [
        ['d6', "A Catholic nun who became a cat-girl crawler, with the title Poet Laureate. She follows the goddess Ysalte and is an uneasy ally of Carl. Paz Lo, an armored cleric, and Anton Lopez, a tattooed fugitive, are in her squad."]] },
      { id: 'gwen', n: 'Gwendolyn Duet', c: 'crawlers', o: 20, g: 'd4', t: [['d4', 'Team leader']], rel: ['katia', 'carl'], s: [
        ['d4', "Gwen, a human fighter who leads her own team on the fifth floor and works with Carl and Katia. Tran is one of hers."]] },
      // ---------- guides & hosts ----------
      { id: 'mordecai', n: 'Mordecai', c: 'guides', o: 1, g: 'd1:0', t: [['d1:0', 'Game guide']], rel: ['carl', 'donut', 'katia', 'odette', 'quint', 'zev'], s: [
        ['d1:0', "Carl and Donut's guide. He was a crawler centuries ago and now works for the game."],
        ['d1', "He tells them no crawler has ever passed the thirteenth floor."],
        ['d2', "He is a changeling. On the third floor he is a skyfowl. When he was a crawler, Odette was his guide."],
        ['d3', "He takes Katia on as well."],
        ['d5', "On the sixth floor he is in the body of a Pocket Kuma."],
        ['d6', "In The Eye of the Bedlam Bride he is a one-eyed Hills Cyclops, and he and Odette are enemies."],
        ['d7', "He makes the team's potions."],
        ['d8', "He has become a shadow-mimic."]] },
      { id: 'zev', n: 'Zev', c: 'guides', o: 2, g: 'd1:0', t: [['d1:0', 'Publicist, Borant Corporation']], rel: ['donut', 'carl', 'loita', 'borant'], s: [
        ['d1:0', "A kua-tin who works for the Borant Corporation as Carl and Donut's publicist. She and Donut get on."],
        ['d3', "Loita replaces her for a time."],
        ['d4', "She falls back in line after threats against her family."],
        ['d5', "She stays Donut's friend, quietly."]] },
      { id: 'loita', n: 'Loita', c: 'guides', o: 3, g: 'd3', t: [['d3', 'Borant enforcer']], rel: ['zev', 'carl', 'borant'], s: [
        ['d3', "A strict Borant enforcer and publicist from the ruling Bloom party who takes over from Zev. She looks down on crawlers."]] },
      { id: 'odette', n: 'Odette', c: 'guides', o: 4, g: 'd1', t: [['d1', 'Talk-show host']], rel: ['mordecai', 'hekla', 'bea', 'show'], s: [
        ['d1', "A former crawler who hosts a popular interview and recap show. She made a deal on the stairs to the thirteenth floor."],
        ['d2', "She was Mordecai's guide when he was a crawler."],
        ['d3', "She sponsors Hekla. The censors often cut her."],
        ['d4', "Bea, on the surface, is her target."],
        ['d6', "She and Mordecai are enemies."]] },
      { id: 'quint', n: 'Quint', c: 'guides', o: 5, g: 'd2', t: [['d2', 'Pharmacist']], rel: ['mordecai', 'desperado'], s: [
        ['d2', "A former crawler who works as a pharmacist in the Desperado Club. A friend of Mordecai's."]] },
      { id: 'chaco', n: 'Chaco the Bard', c: 'guides', o: 6, g: 'd3', t: [['d3', 'Game host']], rel: ['mordecai'], s: [
        ['d3', "A winged NPC with a wolf's head, a game host that viewers send in to make drama. He and Mordecai are enemies."]] },
      // ---------- people of the dungeon ----------
      { id: 'signet', n: 'Signet', c: 'npcs', o: 1, g: 'd2', t: [['d2', 'Half naiad, half high elf'], ['d5', 'Tsarina']], rel: ['carl'], s: [
        ['d2', "A bioengineered NPC, half naiad and half high elf. She holds Carl captive and blackmails him. She and Grimaldi, a circus ringmaster turned into a Pestiferous Vine, love each other."],
        ['d5', "Now Tsarina Signet, a summoner who cannot touch water, and Carl's ally. Queen Imogen of the High Elves is her half-sister."]] },
      { id: 'juicebox', n: 'Juice Box', c: 'npcs', o: 2, g: 'd4', t: [['d4', 'Changeling']], rel: ['louis', 'mordecai', 'ferdinand', 'carl'], s: [
        ['d4', "A changeling in Hump Town, the Dromedarian settlement, who can change shape fast. She passes Carl information. Her brother Henrik secretly leads a sect of Changeling Principals. She and Louis fall for each other."],
        ['d7', "She is centuries old. She is married to Louis and leads the NPCs with Ferdinand."]] },
      { id: 'samantha', n: 'Samantha', c: 'npcs', o: 3, g: 'd5', t: [['d5', 'A banished goddess']], rel: ['louis', 'signet', 'carl'], s: [
        ['d5', "A banished, immortal goddess living in a detached doll's head that rolls along the ground. She is a distant relative of Signet and sides with Carl."],
        ['d6', "She is the spirit of Psamathe, a minor goddess, and she adores Louis."],
        ['d7', "Her mother is Theia."]] },
      { id: 'shimaria', n: 'Shi Maria', c: 'npcs', o: 4, g: 'd6', t: [['d6', 'The Bedlam Bride']], rel: ['carl', 'samantha'], s: [
        ['d6', "The Bedlam Bride, a huge demigod spider and city boss who manipulates Carl."],
        ['d7', "An ancient, spider-like parasite, she lives inside Carl. She was married to the god Hapanzi."]] },
      { id: 'vrah', n: 'Vrah', c: 'npcs', o: 5, g: 'd5', t: [['d5', 'Hunter of the Dark Hive']], rel: ['eva', 'carl'], s: [
        ['d5', "An elite mantis hunter of the Dark Hive who keeps her victims' heads. Her mother is the hive queen, Circe Took. She hunts Carl."]] },
      { id: 'skull', n: 'The Skull Empire', c: 'npcs', o: 6, g: 'd1', t: [['d1', 'Orc royals']], rel: ['carl', 'frankmaggie', 'katia'], s: [
        ['d1', "Prince Maestro of the Skull Empire vows to kill Carl."],
        ['d2', "King Rust rules it. His sons, Crown Prince Stalwart and Prince Maestro, both come after Carl; Maestro was humiliated on air."],
        ['d3', "Princess Formidable sponsors Katia."],
        ['d4', "It sponsors Maggie My."],
        ['d7', "King Rust is an orc, and Formidable is his daughter."],
        ['d8', "Maestro hosts his own show, Death Watch Extreme Dungeon Mayhem."]] },
      { id: 'ferdinand', n: 'Ferdinand', c: 'npcs', o: 7, g: 'd5', t: [['d5', 'A cat familiar']], rel: ['juicebox', 'donut'], s: [
        ['d5', "Queen Imogen's cat familiar, with a golden turban and lightning magic."],
        ['d7', "An orange cat who leads the NPCs with Juice Box, and an ally of Donut."]] },
      { id: 'gary', n: 'Growler Gary', c: 'npcs', o: 8, g: 'd3', t: [['d3', 'Gnoll bartender']], rel: ['donut'], s: [
        ['d3', "A level 25 gnoll bartender who cannot be harmed inside his station. Carl's party takes him apart again and again."],
        ['d7', "He gives Donut advice."]] },
      { id: 'bea', n: 'Beatrice Varr', c: 'npcs', o: 9, g: 'd1:0', t: [['d1:0', "Carl's ex, Donut's owner"]], rel: ['carl', 'donut', 'odette'], s: [
        ['d1:0', "Carl's ex-girlfriend, who cheated on him, and Donut's owner. She never appears inside the dungeon."],
        ['d4', "She survives in the ruined settlements on the surface with Brad. Odette is after her."]] },
      { id: 'chandra', n: 'Princess Chandra', c: 'npcs', o: 10, g: 'd8', t: [['d8', 'Naga lawyer']], rel: ['carl', 'donut'], s: [
        ['d8', "A Naga lawyer who works the galaxy's legal system. She forces Carl to marry her and opposes Donut in law."]] },
      // ---------- rules of the game ----------
      { id: 'system', n: 'The System AI', c: 'rules', o: 1, g: 'd1:0', t: [['d1:0', 'Game master']], rel: ['borant'], s: [
        ['d1:0', "The game master. It controls the loot, the encounters and what crawlers are told. It is snide, mostly fair and less stable as the floors go on, and it is fixated on Carl's feet."],
        ['d8', "It is an unstable, self-aware fragment of an ancient post-biological collective mind."]] },
      { id: 'classes', n: 'Levels, races and classes', c: 'rules', o: 2, g: 'd1:0', t: [['d1:0', 'How crawlers grow']], rel: ['carl', 'donut', 'katia'], s: [
        ['d1:0', "Crawlers gain levels, skills and achievements as they fight."],
        ['d1', "No one can choose a race or class until the third floor."],
        ['d2', "Carl takes the Primal race and the Compensated Anarchist class; Donut is a Former Child Actor; Katia, a doppelganger, is a Monster Truck Driver."]] },
      { id: 'boxes', n: 'Loot boxes', c: 'rules', o: 3, g: 'd1:0', t: [['d1:0', 'Rewards']], rel: ['show'], s: [
        ['d1:0', "Loot comes in boxes, among them benefactor boxes and pet boxes, with legendary and celestial items at the top. What a crawler gets is tied to how many viewers watch, follow and favorite them."]] },
      { id: 'bosses', n: 'Bosses', c: 'rules', o: 4, g: 'd1:0', t: [['d1:0', 'Neighborhood, borough and up']], rel: [], s: [
        ['d1:0', "Floors have neighborhood bosses and borough bosses; later there are province and country bosses."],
        ['d1', "On the first two floors Carl and Donut face a hoarder boss and a level 93 rage elemental, summoned when an old man, Jack, relieved himself in the wrong place."]] },
      { id: 'saferooms', n: 'Safe rooms', c: 'rules', o: 5, g: 'd1:0', t: [['d1:0', 'Shelter']], rel: [], s: [
        ['d1:0', "Rooms where crawlers can shelter and rest. The show plays on their screens."]] },
      { id: 'gods', n: 'Sponsors and gods', c: 'rules', o: 6, g: 'd1:0', t: [['d1:0', 'Help, for a price']], rel: ['carl', 'quiteria'], s: [
        ['d1:0', "Benefactors in the Syndicate can sponsor crawlers. Sponsors and gods can help or harm, and the gods are unreliable at best."],
        ['d6', "Carl follows Emberus. Ysalte, called the Vinegar Bitch, looks like a dwarf with a pickaxe; Sister Quiteria follows her. Ogun, an orisha of iron, labor and war, is the god of Paz Lo and Anton Lopez."],
        ['d8', "Eris, goddess of chaos, tries to become Carl's patron. The Scavenger's Daughter is said to take other gods' powers."]] },
      // ---------- floors & places ----------
      { id: 'floors', n: 'The floors', c: 'places', o: 1, g: 'd1:0', t: [['d1:0', 'Eighteen of them']], rel: ['collapse', 'trains', 'factions'], s: [
        ['d1:0', "There are eighteen floors. Each is open for a set time; anyone not in a stairwell when it closes dies in the collapse, and the bodies become raw material. Nobody has ever got past the thirteenth."],
        ['d1', "Thirteen million people went in. The first floor killed more than ten million of them, and about 1.2 million more died when it collapsed."]] },
      { id: 'trains', n: 'The Iron Tangle', c: 'places', o: 2, g: 'd3', t: [['d3', 'The fourth floor']], rel: ['gary', 'imani'], s: [
        ['d3', "The fourth floor, run on trains. Vernon, a dwarven conductor, believes he is saving to get home to his wife; the story was written for him. Gore-Gore, an eight-foot mantaur engineer, has to attack anyone who damages his train. Fire Brandy, a level 75 lesser demon, fuels the steam engine."]] },
      { id: 'desperado', n: 'The Desperado Club', c: 'places', o: 3, g: 'd2', t: [['d2', 'A club for crawlers']], rel: ['quint', 'katia'], s: [
        ['d2', "A club crawlers can visit. Quint works there as a pharmacist."],
        ['d6', "Astrid, a fairy, is its assistant manager and security chief. Her son, Damascus Steel, an ifrit exotic dancer, works for Carl as a guide."]] },
      { id: 'factions', n: 'The faction wars', c: 'places', o: 4, g: 'd7', t: [['d7', 'The ninth floor']], rel: ['carl', 'donut', 'louis'], s: [
        ['d7', "On the ninth floor armies fight for the central castle. Carl and Donut lead the Princess Posse. Among the others: Empress D'Nadia of the Prism, Architect Houston of the Madness, Epitome Tagg of the Dream and Princess Vinata of the Naga Blood Sultanate."]] },
      // ---------- the show & the Syndicate ----------
      { id: 'collapse', n: 'The collapse', c: 'lore', o: 1, g: 'd1:0', t: [['d1:0', 'How it began']], rel: ['syndicate', 'floors'], s: [
        ['d1:0', "Without warning every man-made structure on Earth fell and killed everyone under a roof. A voice offered the survivors a choice: go down one of the new stairwells into the dungeon, or stay outside in the cold. The Syndicate had taken the planet to mine it."]] },
      { id: 'syndicate', n: 'The Syndicate', c: 'lore', o: 2, g: 'd1:0', t: [['d1:0', 'More than three billion star systems']], rel: ['borant', 'show'], s: [
        ['d1:0', "A federation of more than three billion star systems, led by Prime Minister Glory. It took Earth."]] },
      { id: 'borant', n: 'The Borant Corporation', c: 'lore', o: 3, g: 'd1:0', t: [['d1:0', 'Makes the show']], rel: ['zev', 'loita', 'system'], s: [
        ['d1:0', "The company that makes the show and runs its broadcasts and sponsorships. Its admin sends patch notes and tells crawlers to kill. The kua-tin, who ran their own star system into the ground, are behind it; the crawl is their attempt to avoid bankruptcy."]] },
      { id: 'show', n: 'Dungeon Crawler World', c: 'lore', o: 4, g: 'd1:0', t: [['d1:0', 'The show']], rel: ['odette', 'boxes', 'syndicate'], s: [
        ['d1:0', "This season is Dungeon Crawler World: Earth, broadcast across more than three billion star systems. Recaps and editing decide how crawlers come across. Alien talk shows can pull crawlers out for interviews, for a fee."],
        ['d2', "Carl goes on Odette's show and on Ripper Wonton's Danger Zone."]] }
    ],
    trees: [
      { id: 'rust', n: 'The Skull Empire', g: 'd2', p: [
          ['rust', 'King Rust', 0, 0, { g: 'd2', t: 'King', e: 'skull' }],
          ['stalwart', 'Stalwart', 1, 0, { g: 'd2', t: 'Crown Prince', e: 'skull' }], ['maestro', 'Maestro', 1, 1, { g: 'd1', t: 'Prince', e: 'skull' }], ['formidable', 'Formidable', 1, 2, { g: 'd3', t: 'Princess', e: 'skull' }]],
        u: [], k: [['rust', 'stalwart', ''], ['rust', 'maestro', ''], ['rust', 'formidable', '']], l: [] }
    ],
    charts: [
      { id: 'floorbook', n: 'The books and their floors', g: 'd1:0', type: 'table', note: 'As the sources give them.', cols: ['Book', 'Floor'], rows: [
          { c: ['Dungeon Crawler Carl', [['d1:0', 'The first and second floors']]] },
          { c: ["Carl's Doomsday Scenario", [['d2', 'The third floor, Over City']]] },
          { c: ["The Dungeon Anarchist's Cookbook", [['d3', 'The fourth floor, the Iron Tangle']]] },
          { c: ['The Gate of the Feral Gods', [['d4', 'The fifth floor, a bubble holding four castles']]] },
          { c: ["The Butcher's Masquerade", [['d5', 'The sixth floor, the Hunting Grounds: hunters go after crawlers, with bounties on the top ten']]] },
          { c: ['The Eye of the Bedlam Bride', [['d6', 'The eighth floor, Bedlam']]] },
          { c: ['This Inevitable Ruin', [['d7', 'The ninth floor, the faction wars']]] },
          { c: ['A Parade of Horribles', [['d8', 'The tenth floor, a race']]] }] },
      { id: 'classes', n: 'Classes', g: 'd2', type: 'cards', note: 'The class each source gives for that book.', items: [
          { n: 'Carl', sub: 'Primal', lines: [['d2', 'Compensated Anarchist'], ['d5', 'Agent Provocateur, on the sixth floor']] },
          { n: 'Princess Donut', sub: 'Show cat', lines: [['d2', 'Former Child Actor'], ['d5', 'Legendary Diva, a bard'], ['d8', 'Assassin of Sekhmet']] },
          { n: 'Katia', sub: 'Doppelganger', lines: [['d2', 'Monster Truck Driver']] },
          { n: 'Hekla', sub: 'Amazonian', lines: [['d2', 'Shieldmaiden']] },
          { n: 'Prepotente', sub: 'Goat', lines: [['d5', 'Profane Vitiate']] }] },
      { id: 'mordecai', n: "Mordecai's bodies", g: 'd2', type: 'cards', note: 'He is a changeling; the game changes his body.', items: [
          { n: 'Skyfowl', sub: "Carl's Doomsday Scenario", lines: [['d2', 'On the third floor.']] },
          { n: 'Pocket Kuma', sub: "The Butcher's Masquerade", lines: [['d5', 'On the sixth floor.']] },
          { n: 'Hills Cyclops', sub: 'The Eye of the Bedlam Bride', lines: [['d6', 'One-eyed.']] },
          { n: 'Shadow-mimic', sub: 'A Parade of Horribles', lines: [['d8', 'Still the guide.']] }] }
    ]
  });
})();
