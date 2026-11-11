// ===== L45: Encyclopedia data — The Empyrean. fw = Fourth Wing, if = Iron Flame, os = Onyx Storm; book:0 = started, a bare key = finished.
// Facts are checked against the pages in src. Iron Flame opens chapter by chapter (if:1 = through ch 4 … if:16 = through ch 61; a bare if = finished);
// Onyx Storm stays sealed until it is finished.
(function () { if (!window.L29) return;
  L29.add({ k: 'empyrean', n: 'The Empyrean', short: 'Empyrean', world: 'Navarre', by: 'Rebecca Yarros', skin: 'ink', spines: ['#1d1b20', '#8f1f2b', '#c9a227', '#2f5d8f', '#3d6b3a'], acc: '#ff4d6d', hue: ['#3a1018', '#0d0b0c'], badge: 'Crossed the Parapet',
    about: [['', "Navarre has kept its borders behind magical wards for centuries and is at war with Poromiel. At Basgiath War College, cadets who want to ride must survive the Riders Quadrant and be chosen by a dragon."]],
    src: [['The Empyrean Wiki, Riders Quadrant', 'https://the-empyrean-series.fandom.com/wiki/Riders_Quadrant'], ['The Empyrean Wiki, Fen Riorson', 'https://the-empyrean-series.fandom.com/wiki/Fen_Riorson'], ['The Empyrean Wiki, Mira Sorrengail', 'https://the-empyrean-series.fandom.com/wiki/Mira_Sorrengail'],
      ['Audible, the Empyrean series explained', 'https://www.audible.com/blog/empyrean-series-explainer-fourth-wing'], ['Audible, dragon and signet guide', 'https://www.audible.com/blog/article-fourth-wing-dragon-signet-guide'], ['Audible, Violet Sorrengail', 'https://www.audible.com/blog/article-violet-sorrengail-character-guide'], ['Audible, Xaden Riorson', 'https://www.audible.com/blog/article-fourth-wing-xaden-character-guide'],
      ['Empyrean Riders, characters, dragons and signets', 'https://www.empyreanriders.com/articles/guide-to-fourth-wing-characters-dragons-signets/'], ['Empyrean Riders, Iron Flame', 'https://www.empyreanriders.com/?p=1849']],
    books: [
      { k: 'fw', t: 'Fourth Wing', sp: 'Fourth Wing', m: '^Fourth Wing' },
      { k: 'if', t: 'Iron Flame', sp: 'Iron Flame', m: '^Iron Flame', raw: 1, chs: 66, ch: [4, 8, 12, 17, 20, 23, 27, 31, 36, 39, 43, 48, 51, 54, 57, 61], parts: ['Ch 1–4', 'Ch 5–8', 'Ch 9–12', 'Ch 13–17', 'Ch 18–20', 'Ch 21–23', 'Ch 24–27', 'Ch 28–31', 'Ch 32–36 · end of Part One', 'Ch 37–39', 'Ch 40–43', 'Ch 44–48', 'Ch 49–51', 'Ch 52–54', 'Ch 55–57', 'Ch 58–61'] },
      { k: 'os', t: 'Onyx Storm', sp: 'Onyx Storm', m: '^Onyx Storm' }],
    cats: { people: 'People', dragons: 'Dragons', powers: 'Magic & Signets', school: 'Basgiath & the Codex', places: 'Places', lore: 'History & Lore' },
    e: [
      // ---------- people ----------
      { id: 'violet', n: 'Violet Sorrengail', c: 'people', o: 1, g: 'fw:0', t: [['fw:0', 'First-year cadet'], ['fw', 'Rider of Tairn and Andarna']], rel: ['lilith', 'mira', 'brennan', 'asher', 'xaden', 'dain', 'tairn', 'andarna'], s: [
        ['fw:0', "About twenty, the youngest child of General Lilith Sorrengail. She trained to be a scribe like her father, Asher, but her mother sent her to the Riders Quadrant. A fever while her mother was pregnant left her small, with chronic pain, joints that dislocate and bones that break easily."],
        ['fw', "At Threshing she defended a small dragon from three cadets. Tairn, a black morningstartail, chose her, and the small one, Andarna, a golden feathertail, chose her too, which made her the first rider bonded to two dragons. Her signet is lightning. Through Andarna she could stop time for a moment, at a cost to them both."],
        ['fw', "She learned that venin are real when they attacked a town near the border. Fighting beside the rebels to defend it, she was stabbed with a poisoned blade and woke days later to find Brennan alive."],
        ['if:0', "In the kitchen of the fortress in Aretia she eats for the first time in three days, since the poisoned blade. Brennan mended her wound, and she slept through her twenty-first birthday. Bodhi arrives with a message from Basgiath."],
        ['if:1', "Back at Basgiath she and Xaden told a cover story: they had been sent to Athebyne, where gryphons killed Liam and Soleil's dragons. She is a second-year now."],
        ['if:2', "Because their dragons are mated, she and Xaden have leave to see each other every seven days. She will not take him back until he tells her his secrets. In the Archives she looks for how the wards were made, hoping to fix Aretia's."],
        ['if:3', "A first-year sent to kill her killed her squadmate Nadine, and Violet killed him."],
        ['if:4', "Vice Commandant Varrish made her wield lightning over and over until she nearly burned out. Jesinia agreed to search the Archives for her."],
        ['if:5', "She flew to Samara to see Xaden. They agreed to tell each other anything that could change the other's choices."],
        ['if:6', "She found that the First Six carved the first wardstone themselves, and probably Aretia's too. Varrish took her and her friends to interrogation training."],
        ['if:7', "Varrish wrenched her injured arm out of its socket. She felt power in her dagger and used it to open the lock while Sawyer melted the hinges, and the four escaped. When Samara was attacked she flew there without leave."],
        ['if:8', "She told Rhiannon, Ridoc and Sawyer the truth about the venin. Assassins caught her on watch on the parapet; Eya was killed, and Jack Barlowe saved Violet."],
        ['if:9', "Nolon drugged her, and Varrish held her in the brig as bait for Xaden. Dain read her memories, saw what she had seen, and freed her, and she and Xaden killed Varrish. She told Xaden she loves him. About a hundred riders and two hundred dragons followed them to Aretia."],
        ['if:10', "In Aretia she is translating Warrick's journal, which is written in a dead language."],
        ['if:11', "Felix is teaching her to aim, with a runed glass orb as a conduit. At Viscount Tecarus's estate she killed a venin he had set loose by sending lightning through the wet grass."],
        ['if:12', "On the Cliffs of Dralor a flier, Luella, fell to her death. Violet drew off a group of wyvern and killed four with lightning sent into the clouds."],
        ['if:13', "Her squad was merged with Cat's drift. Working through Krovlish texts with Dain, she found the ritual needs the breath, the fire, of six dragons, not the blood of six riders."],
        ['if:16', "She flew to defend Basgiath with the riders who would come, against the Assembly's vote. Her mother's storm strengthened her lightning against the wyvern horde."],
        ['if', "She studied the wards, looking for a way to strengthen them and stretch them to protect Poromiel. Brennan mended Basgiath's wardstone and Andarna lit it, and the wards came back."],
        ['os', "Her second signet is dreamwalking, Andarna's gift."]] },
      { id: 'xaden', n: 'Xaden Riorson', c: 'people', o: 1, g: 'fw:0', t: [['fw:0', 'Wingleader, Fourth Wing'], ['if', 'Lieutenant']], rel: ['fen', 'sgaeyl', 'violet', 'liam', 'bodhi', 'marked', 'relics'], s: [
        ['fw:0', "Two years ahead of Violet at Basgiath and wingleader of Fourth Wing. He is the son of Fen Riorson, who led the rebellion and was executed for it, and he carries a rebellion relic that runs from his left wrist up his neck. He has said he will kill Violet. His dragon is Sgaeyl, a blue daggertail, and his signet is shadows."],
        ['fw', "He is the eldest of the hundred and eight children orphaned by the rebellion and answers for the rest."],
        ['fw', "Sgaeyl is mated to Tairn, which ties him to Violet: each can speak to the other's dragon. He became her wingleader, advised her and built her a saddle, and their bond turned into love. At the end he sat at her bedside in Aretia, where she learned Brennan was alive."],
        ['if:1', "He and the other third-years graduated as lieutenants and were ordered out the next day."],
        ['if:2', "He told Violet not to join the revolution: without a rebellion relic she has no protection from General Melgren's signet."],
        ['if:3', "At Athebyne his team hands out alloy daggers to gryphon fliers. He warded Violet's door so that only she, and anyone she allows, can open it."],
        ['if:4', "He is posted at Samara."],
        ['if:6', "Dain told Violet that her mother is the reason for the hundred and seven scars on Xaden's back, and that she carved them herself."],
        ['if:7', "He saved the outpost at Samara and nearly lost an arm doing it."],
        ['if:8', "He supplies gryphon fliers with stolen daggers. Catriona, one of their fliers, is his former partner."],
        ['if:9', "He told Violet he loves her. Her mother had made a deal with him: the marked ones could survive at Basgiath if he kept Violet alive in her first year."],
        ['if:10', "He is the seventh member of the Assembly, and Riorson House is his."],
        ['if:12', "He is the rightful duke of Tyrrendor. He and Catriona were betrothed for a year before he ended it. One of the daggers he gave Violet is runed against Cat's signet."],
        ['if:13', "He was fighting in Pavis when it fell, until Mira ordered him to retreat."],
        ['if:15', "His second signet is inntinnsic: he reads the intentions behind people's thoughts, not the thoughts themselves. Inntinnsics are killed once their power shows, so he kept it secret."],
        ['if:16', "His mother left when he was ten. Sgaeyl, who had been bonded to his grandfather, helped him hide his second signet."],
        ['if', "To save Violet he drew power from the earth and became venin."]] },
      { id: 'dain', n: 'Dain Aetos', c: 'people', o: 2, g: 'fw:0', t: 'Squad leader, second year', rel: ['violet', 'aetos', 'cath'], s: [
        ['fw:0', "Violet's childhood best friend, a second-year and her squad leader. He tried to steer her toward the scribes to keep her safe. His dragon is Cath, a red swordtail."],
        ['fw', "His signet is retrocognition: by touching someone he can see their memories. Violet stopped trusting him when she learned he had used it on her without asking."], ['if:2', "He is the new wingleader."], ['if:6', "He says he never meant the ambush or Liam's death when he reported what he read in Violet's memories."], ['if:7', "He refused Varrish's order to read Violet's memories, citing the Codex."], ['if:9', "Made to read her memories after all, he saw Resson and the venin, turned on Varrish and freed her. As wingleader he told the quadrant the truth."], ['if:13', "He apologised for trusting his father over Violet in the War Games, and helps her with the Krovlish texts."]] },
      { id: 'liam', n: 'Liam Mairi', c: 'people', o: 2, g: 'fw:0', t: 'First-year, a rebellion child', rel: ['xaden', 'sloane', 'deigh', 'marked'], s: [
        ['fw:0', "One of the rebellion's children, raised in foster care alongside Xaden, who asked him to watch over Violet. His dragon is Deigh, a red daggertail."],
        ['fw', "His signet is farsight. He died protecting Violet, and she promised to look after his sister, Sloane."],
        ['if:1', "Violet and Xaden found the letters he wrote to his sister."]] },
      { id: 'rhiannon', n: 'Rhiannon Matthias', c: 'people', o: 2, g: 'fw:0', t: 'First-year', rel: ['violet', 'feirge'], s: [['fw:0', "A first-year in Violet's squad, Second Squad of Flame Section in Fourth Wing, and her friend."], ['fw', "Her dragon is Feirge, a green daggertail, and her signet is summoning."], ['if:2', "She is the squad's new leader."], ['if:8', "Her signet pulled a stolen dagger out of Violet's jacket before Varrish could find it."]] },
      { id: 'ridoc', n: 'Ridoc Gamlyn', c: 'people', o: 3, g: 'fw:0', t: 'First-year', rel: ['violet', 'aotrom'], s: [['fw:0', "A first-year in Violet's squad."], ['fw', "His dragon is Aotrom, a brown swordtail, and his signet is ice."], ['if:8', "He saw in a ledger that Lyra and Warrick, two of the First Six, kept journals."]] },
      { id: 'sawyer', n: 'Sawyer Henrick', c: 'people', o: 3, g: 'fw:0', t: 'First-year, repeating the year', rel: ['violet', 'sliseag'], s: [['fw:0', "A first-year in Violet's squad who is repeating the year after failing to bond."], ['fw', "This time he bonded Sliseag, a red swordtail."], ['if:7', "His signet melted the hinges of the door in the interrogation."], ['if', "A wyvern took his leg below the knee."]] },
      { id: 'imogen', n: 'Imogen Cardulo', c: 'people', o: 3, g: 'fw:0', t: 'Second-year', rel: ['xaden'], s: [['fw:0', "A second-year in Violet's squad."], ['fw', "Her signet wipes away recent memories."]] },
      { id: 'garrick', n: 'Garrick Tavis', c: 'people', o: 3, g: 'fw:0', t: 'Flame Section leader', rel: ['xaden'], s: [['fw:0', "A third-year and leader of Flame Section, the section Violet's squad belongs to."]] },
      { id: 'bodhi', n: 'Bodhi Durran', c: 'people', o: 3, g: 'fw:0', t: "Xaden's cousin", rel: ['xaden', 'fen'], s: [['fw:0', "Xaden's cousin, the son of Fen Riorson's sister, and the nearest thing Xaden has to a brother. He is also a rider."]] },
      { id: 'jack', n: 'Jack Barlowe', c: 'people', o: 3, g: 'fw:0', t: 'First-year', rel: ['violet', 'baide'], s: [['fw:0', "A first-year cadet and Violet's enemy."], ['fw', "His dragon is Baide, an orange scorpiontail."], ['if:7', "He is alive. Violet thought she had killed him; Nolon mended him."], ['if:8', "He saved Violet from an assassin on the parapet, saying his death had given him a second chance."], ['if:16', "He turned venin before his apparent death the year before. He killed his dragon, Baide, on Basgiath's wardstone and the wards fell, and he planted rune lures across the college."]] },
      { id: 'mira', n: 'Mira Sorrengail', c: 'people', o: 2, g: 'fw:0', t: 'First Lieutenant', rel: ['violet', 'lilith', 'brennan', 'teine'], s: [
        ['fw:0', "Violet's older sister, a first lieutenant and rider who won the Order of the Talon at the Battle of Strythemore and patrols the border with the Eastern Wing. She argues with their mother and never stops. She gave Violet a scale vest and rider's boots, and repacked her bag."],
        ['fw', "Her dragon is Teine, a green clubtail. Her signet extends Navarre's wards to cover herself and other riders."],
        ['if:5', "Now stationed at Samara, she warned Violet not to trust Xaden."],
        ['if:10', "After their mother told the Samara riders the truth, Mira brought about forty of them to Aretia, and punched Brennan for faking his death."],
        ['if:11', "Her ward shield held off a venin's wave of death at Tecarus's estate."]] },
      { id: 'brennan', n: 'Brennan Sorrengail', c: 'people', o: 2, g: 'fw:0', t: [['fw:0', 'Believed dead'], ['fw', 'Alive, with the rebels']], rel: ['violet', 'mira', 'lilith', 'fen', 'marbh'], s: [
        ['fw:0', "The eldest Sorrengail child, a rider believed killed in the rebellion. His death broke their father."],
        ['fw', "At the Battle of Aretia, Fen Riorson shot him in the chest with a crossbolt. He lived. His signet is mending, his dragon is Marbh, an orange daggertail, and he is with the rebels in Aretia."], ['if:0', "He mended Violet after the poisoned blade."], ['if:1', "He faked his death and joined the resistance under the name Aisereigh. Naolin brought him back with his signet and died doing it. Mira does not know he is alive."], ['if:15', "He refused to help defend Navarre after it left so many people to die."]] },
      { id: 'lilith', n: 'General Lilith Sorrengail', c: 'people', o: 2, g: 'fw:0', t: 'Commanding general of Basgiath', rel: ['violet', 'mira', 'brennan', 'asher', 'aimsir', 'fen'], s: [
        ['fw:0', "Commanding general of Basgiath War College and Violet's mother. She captured Fen Riorson. Her dragon is Aimsir, a brown. Her signet is the power of storms."],
        ['if:9', "She has been working with Xaden. She offered the marked ones a chance at Basgiath in return for his keeping Violet alive, and she gave him the hundred and seven scars."],
        ['if:15', "She learned Brennan is alive. She gave Violet Lyra's journal and asked the rebels to help defend Samara."],
        ['if:16', "Her storm signet strengthened Violet's lightning in the battle for Basgiath."],
        ['if', "She gave her life to save Violet and put the wards back."]] },
      { id: 'asher', n: 'Asher Sorrengail', c: 'people', o: 3, g: 'fw:0', t: 'Scribe, died before the story', rel: ['violet', 'lilith'], s: [['fw:0', "Violet's father, a scribe. He died of heart failure about a year before Violet entered the quadrant, grieving the son he thought he had lost."]] },
      { id: 'fen', n: 'Fen Riorson', c: 'people', o: 2, g: 'fw:0', t: 'Led the rebellion, executed', rel: ['xaden', 'bodhi', 'rebellion', 'codagh'], s: [
        ['fw:0', "Xaden's father, who began and led the Tyrrish rebellion. General Sorrengail captured him, and he was executed by Codagh's fire with the rest of the rebellion's leaders."],
        ['fw', "He sent Xaden away before the Battle of Aretia to keep him safe, and they parted in anger. Under questioning he accused the king and the kings before him of a conspiracy. His last words were: You're all cowards."]] },
      { id: 'melgren', n: 'General Melgren', c: 'people', o: 3, g: 'fw:0', t: 'Commanding general of Navarre', rel: ['codagh'], s: [['fw:0', "Commanding general of Navarre's forces. His dragon is Codagh, a black swordtail. His signet shows him the outcome of battles."]] },
      { id: 'aetos', n: 'Colonel Aetos', c: 'people', o: 4, g: 'fw:0', t: "Dain's father", rel: ['dain', 'lilith'], s: [['fw:0', "Dain's father and an adviser to General Sorrengail."]] },
      { id: 'naolin', n: 'Naolin', c: 'people', o: 4, g: 'fw', t: "Tairn's last rider", rel: ['tairn'], s: [['fw', "Tairn's rider before Violet. He died at Aretia. His signet was siphoning power."], ['if:1', "He died bringing Brennan back with his signet."]] },
      { id: 'nolon', n: 'Nolon', c: 'people', o: 4, g: 'fw:0', t: 'Mender', s: [['fw:0', "An old rider whose signet is mending."], ['if:7', "He mended Jack Barlowe."], ['if:9', "He drugged Violet for Varrish."]] },
      { id: 'kaori', n: 'Professor Kaori', c: 'people', o: 4, g: 'fw:0', t: 'Teaches about dragons', s: [['fw:0', "Teaches about dragons. His dragon is Smachd."]] },
      { id: 'jesinia', n: 'Jesinia Neilwart', c: 'people', o: 4, g: 'fw:0', t: 'Scribe', rel: ['violet'], s: [['fw:0', "A cadet in the Scribe Quadrant."]] },
      { id: 'sloane', n: 'Sloane Mairi', c: 'people', o: 4, g: 'fw', t: "Liam's sister", rel: ['liam'], s: [['fw', "Liam's younger sister, due to enter the Riders Quadrant the year after. Violet promised Liam she would look after her."], ['if:2', "She crossed the parapet, blames Violet for Liam's death, and was put in Violet's squad."], ['if:4', "She trains with Imogen, in exchange for one of Liam's unsent letters each week."], ['if:11', "She has read Liam's letters and does not hate Violet after all."], ['if:14', "Her signet manifested: she is a siphon, who absorbs power and passes it on."], ['if', "She channels power to help restore the wards."]] },

      { id: 'aaric', n: 'Aaric Graycastle', c: 'people', o: 3, g: 'if:2', t: 'First-year', rel: ['violet', 'dain'], s: [['if:2', "A first-year who crossed the parapet under a false name. He is Prince Camlaen Aaric Tauri, the king's third-youngest son, and Violet and Dain let him through."], ['if:6', "He ran away from the palace to become a rider because he knows about the venin."], ['if:9', "He hates his father and opened the royal vault for Violet; its wards burned his hands."]] },
      { id: 'varrish', n: 'Major Burton Varrish', c: 'people', o: 3, g: 'if:2', t: 'Vice commandant', rel: ['violet', 'tairn'], s: [['if:2', "The new vice commandant at Basgiath. His dragon, Solas, killed first-years who fled at the sight of dragons."], ['if:4', "He wants Violet to bring Andarna to him and searches her bag when she does not."], ['if:9', "His signet shows him people's weaknesses. Violet and Xaden killed him."]] },
      { id: 'cat', n: 'Catriona', c: 'people', o: 4, g: 'if:8', t: 'Gryphon flier', rel: ['xaden'], s: [['if:8', "A gryphon flier from Poromiel who goes by Cat, and Xaden's former partner. She rides with Syrena, who speaks for the fliers."], ['if:11', "She is Viscount Tecarus's niece. Her signet heightens and steers emotions."], ['if:12', "Her signet can only strengthen what someone already feels."], ['if:14', "She is in the line of succession to Poromiel's throne."]] },
      { id: 'felix', n: 'Felix', c: 'people', o: 4, g: 'if:10', t: 'Rider in Aretia', rel: ['violet'], s: [['if:10', "One of the six strongest riders in Aretia."], ['if:11', "He teaches Violet to aim her lightning."]] },
      { id: 'grady', n: 'Professor Grady', c: 'people', o: 4, g: 'if:2', t: 'Rider Survival Course', s: [['if:2', "Teaches the secret Rider Survival Course: finding your way, surviving and resisting torture if you are cut off from your dragon behind enemy lines."]] },
      { id: 'carr', n: 'Professor Carr', c: 'people', o: 4, g: 'if:4', t: 'Wielding professor', s: [['if:4', "Teaches wielding at Basgiath. He stopped Varrish's punishment of Violet, pointing out that her death could kill Xaden and both dragons too."]] },

      // ---------- dragons ----------
      { id: 'tairn', n: 'Tairn', c: 'dragons', o: 1, g: 'fw', t: 'Black morningstartail', rel: ['violet', 'sgaeyl', 'naolin', 'andarna'], s: [['fw', "Tairneanach, a huge black morningstartail. Black dragons are the rarest. He chose Violet at Threshing. His rider before her was Naolin. He is mated to Sgaeyl, so he can speak to Xaden and Sgaeyl to Violet. Violet's lightning comes through him."], ['if:2', "When Solas, the vice commandant's dragon, killed first-years who ran from the dragons, Tairn came and warned Solas and Varrish never to harm Violet."], ['if:5', "He attacked Solas when Varrish charged Violet with dereliction of duty, and Varrish withdrew the charge on his knees."]] },
      { id: 'andarna', n: 'Andarna', c: 'dragons', o: 1, g: 'fw', t: [['fw', 'Golden feathertail'], ['if:1', 'Growing up, now black']], rel: ['violet', 'tairn'], s: [
        ['fw', "Andarnaurram, a small golden feathertail that Violet defended from three cadets at Threshing. She chose Violet as well. Through her, Violet could stop time for a moment, at a cost to both of them."],
        ['if:1', "She has doubled in size, her scales have turned black, and she can no longer stop time now that she is becoming an adolescent."],
        ['if:3', "She is still young and must grow in the Dreamless Sleep, away from people. No one can be told, because the Empyrean protects young dragons."],
        ['if:10', "She grew so fast after Resson that she never formed the second set of wing muscles. Tairn thinks she will fly, but never carry a rider."],
        ['if:14', "When Solas, Varrish's dragon, attacked Violet, Sloane and Cat in a cave, Andarna shielded them with her wings and killed him."],
        ['if', "She breathes fire now. She waited six hundred and fifty years to hatch, and she is not black: she is a seventh kind of dragon, which made it possible to light Basgiath's wardstone again."],
        ['os', "She is an irid, a seventh kind of dragon that can change colour and use magic other dragons cannot."]] },
      { id: 'sgaeyl', n: 'Sgaeyl', c: 'dragons', o: 2, g: 'fw:0', t: 'Blue daggertail', rel: ['xaden', 'tairn'], s: [['fw:0', "Xaden's dragon, a blue daggertail."], ['fw', "She is mated to Tairn, which ties their riders together. She can speak to Violet."]] },
      { id: 'codagh', n: 'Codagh', c: 'dragons', o: 3, g: 'fw:0', t: 'Black swordtail', rel: ['melgren', 'fen'], s: [['fw:0', "General Melgren's dragon, a black swordtail. His fire executed Fen Riorson and the rebellion's leaders."]] },

      // ---------- magic and signets ----------
      { id: 'bond', n: 'Bonds and channeling', c: 'powers', o: 1, g: 'fw:0', t: 'Where a rider gets power', rel: ['signets', 'threshing', 'colours'], s: [
        ['fw:0', "A dragon chooses its rider. Through the bond, the rider channels the dragon's power, first for small things like moving an object or opening a lock, which is lesser magic."],
        ['fw', "A stronger dragon and a stronger bond let a rider channel more. Mated dragons tie their riders: each rider can speak to the other's dragon."]] },
      { id: 'signets', n: 'Signets', c: 'powers', o: 1, g: 'fw:0', t: "A rider's own gift", rel: ['bond', 'chart:pairs'], s: [
        ['fw:0', "A signet is the power a rider manifests in the months after Threshing, unique to the rider, the dragon and their bond. A rider whose signet never shows can die. Signets range from controlling weather to mending, and tend to match the rider."],
        ['if:14', "A second signet comes only when a dragon bonds someone in the direct line of its last rider. They develop a second signet or go mad."],
        ['if:15', "Inntinnsics, who read intentions, are killed once their power shows."]] },
      { id: 'colours', n: 'Dragon colours and tails', c: 'powers', o: 2, g: 'fw:0', t: 'Six colours, six tails', rel: ['chart:dragons'], s: [
        ['fw:0', "Dragons come in six colours: blue, red, orange, black, brown and green. Each has a temper: reds are the quickest to anger, blacks the rarest and cleverest, greens the most rational. Tails are not tied to colour: scorpiontail, daggertail, morningstartail, swordtail, clubtail and feathertail."],
        ['os', "There is a seventh kind, the irids."]] },
      { id: 'wards', n: 'The wards', c: 'powers', o: 2, g: 'fw:0', t: "Navarre's protection", rel: ['navarre', 'mira'], s: [
        ['fw:0', "Ancient magical wards have protected Navarre for centuries. Mira's signet extends them around her and other riders."],
        ['if:5', "The First Six, the first dragon riders about six hundred years ago, made the wards. Mira explains them as woven into the ground like the spokes of an umbrella around the wardstone at Basgiath, weaker the farther they reach."],
        ['if:6', "The First Six carved the first wardstone themselves."],
        ['if:8', "Lyra and Warrick, two of the First Six, kept journals, held in the royal vault, which only the king's bloodline can open."],
        ['if:9', "Warrick's journal says the First Six set a wardstone where dragons feel the deepest currents of magic."],
        ['if:10', "Trying to raise Aretia's wards with the blood of its six strongest riders did nothing."],
        ['if:13', "The ritual needs the fire of six dragons, one of each kind."],
        ['if:15', "Six dragons breathed fire on Aretia's wardstone. Wyvern that hit the wards dropped dead, but fliers could still wield, so the wards were not whole. Warrick's journal left something out; Lyra's should hold the rest."],
        ['if:16', "Jack spilled his dragon's blood on Basgiath's wardstone and its wards fell."],
        ['if', "When the wardstone at Basgiath was destroyed, the wards there fell, and Lilith Sorrengail gave her life to raise them again."]] },
      { id: 'venin', n: 'Venin', c: 'powers', o: 1, g: 'fw', t: 'Not a myth', rel: ['poromiel', 'xaden'], s: [
        ['fw', "Thought to be creatures of legend. They are real: they drain the power of the land to make themselves strong, and they attack Poromiel while Navarre does nothing."],
        ['if:1', "In the old fables, venin come from the Barrens, drain the magic from cities and pour their power into wyvern."],
        ['if:3', "The rebels give gryphon fliers alloy daggers to fight venin and wyvern."],
        ['if:7', "Zolya, the third-largest city in the province of Braevick, fell to what the reports call blue-fire dragons. Violet takes them for wyvern."],
        ['if:10', "Venin destroyed Anca, near Zolya, which looks like a venin base."],
        ['if:13', "The venin took Pavis."],
        ['if:15', "Wyvern are made with runes: a runestone inside keeps bringing them back."],
        ['if', "Navarre's leaders have lied for generations, denying the venin exist and blaming Poromiel for their attacks."]] },
      { id: 'relics', n: 'Rebellion relics', c: 'powers', o: 2, g: 'fw:0', t: 'The marks on the rebellion children', rel: ['marked', 'xaden'], s: [['fw:0', "The children of the executed rebels carry rebellion relics, dark marks on their skin. Xaden's runs from his left wrist up his neck."], ['if:12', "Each of them was given a runestone that hides them from the signet of the dragon that executed their parents, which is why General Melgren cannot see their battles."]] },

      { id: 'luminary', n: 'Luminaries and the alloy', c: 'powers', o: 2, g: 'if:1', t: 'The weapons that kill venin', rel: ['venin', 'wards'], s: [
        ['if:1', "A luminary makes dragon fire hot enough to smelt the alloy for the only weapons that kill venin. Aretia needs one."],
        ['if:3', "The daggers are made of the same material that powers the wards. Each holds only so much power and has to be refilled by a rider."],
        ['if:5', "The alloy is talladium, other ores and dragon eggshell."],
        ['if:8', "Viscount Tecarus will give his luminary to Aretia if he sees Violet wield."],
        ['if:11', "He agreed to give it in return for weapons for his fliers, and sent a hundred flier cadets to train in Aretia."]] },

      { id: 'runes', n: 'Runes', c: 'powers', o: 2, g: 'if:12', t: 'Power woven into objects', rel: ['relics', 'wards'], s: [['if:12', "Strands of power drawn from a rider and woven into patterns for a purpose, then tempered into an object, which can be used until its power runs out. Trissa of the Assembly teaches them. Xaden put an unlocking rune on Violet's dagger."]] },

      // ---------- Basgiath and the Codex ----------
      { id: 'basgiath', n: 'Basgiath War College', c: 'school', o: 1, g: 'fw:0', t: "Navarre's war college", rel: ['quadrant', 'parapet', 'codex'], s: [['fw:0', "Navarre's war college. Violet meant to join the Scribe Quadrant; her mother sent her to the Riders Quadrant instead. About a quarter of the riders' cadets graduate."]] },
      { id: 'quadrant', n: 'The Riders Quadrant', c: 'school', o: 1, g: 'fw:0', t: 'Wings, sections, squads', rel: ['chart:structure', 'parapet', 'threshing'], s: [
        ['fw:0', "Four wings, each split into three sections, flame, claw and tail, each of three squads. Wingleaders and section leaders are third-years. First-years sit in the back two rows of their squad. Everyone is a cadet until a dragon chooses them at Threshing."],
        ['fw', "Riders sit at the top of Navarre's military, rise faster, marry earlier and are paid more. A new rider serves four years with a combat wing before reassignment. Most do not live to retire."]] },
      { id: 'parapet', n: 'The Parapet', c: 'school', o: 2, g: 'fw:0', t: 'Conscription Day', rel: ['quadrant'], s: [['fw:0', "On Conscription Day every candidate for the Riders Quadrant must cross the parapet. About fifteen in a hundred die. In Violet's year it was nearly twenty, probably because of the weather. Weapons carried across count as the cadet's own."]] },
      { id: 'threshing', n: 'Gauntlet, Presentation and Threshing', c: 'school', o: 2, g: 'fw:0', t: 'How a dragon chooses', rel: ['bond', 'quadrant'], s: [
        ['fw:0', "The Gauntlet is a climbing course cut into the ridge between the citadel, the flight field and the Vale. A cadet must finish it to go to Threshing. On Presentation Day the cadets walk in a line across the meadow while the dragons look them over."],
        ['fw:0', "At Threshing, on the first of October, the cadets go into the field to find a dragon. Older riders watch and cannot step in, and some first-years use it to kill cadets they think unfit. A bonded dragon tests its rider in flight and may let an unworthy one fall."]] },
      { id: 'codex', n: 'The Codex', c: 'school', o: 2, g: 'fw:0', t: "The quadrant's law", rel: ['quadrant', 'challenges'], s: [['fw:0', "Only riders and appointed scribes may enter the quadrant uninvited. Cadets in the same squad may not kill each other. Stealing is forbidden. Romance is discouraged, not banned. The commandant's office has the last word on punishment."]] },
      { id: 'challenges', n: 'Challenges', c: 'school', o: 3, g: 'fw:0', t: 'Sparring on the mat', rel: ['codex'], s: [['fw:0', "Sparring matches start a couple of weeks into the year and are set a week ahead. Throwing weapons is banned, and riders are not supposed to use lesser magic or signets on the mat."]] },

      // ---------- places ----------
      { id: 'navarre', n: 'Navarre', c: 'places', o: 1, g: 'fw:0', t: 'The kingdom', rel: ['wards', 'poromiel', 'basgiath'], s: [['fw:0', "A kingdom built around its military and protected for centuries by wards. Its leaders teach that the greatest threat lies beyond the border, above all in Poromiel."]] },
      { id: 'poromiel', n: 'Poromiel', c: 'places', o: 2, g: 'fw:0', t: 'The enemy across the border', rel: ['navarre', 'venin'], s: [['fw:0', "The kingdom Navarre is at war with."], ['fw', "The venin attack it, and Navarre refuses to help."]] },
      { id: 'aretia', n: 'Aretia', c: 'places', o: 2, g: 'fw:0', t: "The rebellion's city", rel: ['fen', 'rebellion', 'brennan'], s: [['fw:0', "The city at the heart of the rebellion, where the Battle of Aretia was fought."], ['fw', "Riorson House in Aretia is the rebellion's headquarters. Brennan is there."], ['if:0', "Aretia, capital of the province of Tyrrendor, is thought to be in ruins, but the rebels are rebuilding it in secret. Seven leaders, the Assembly, govern it."], ['if:1', "Its wardstone does not work, so it has little time before the venin reach it."]] },
      { id: 'athebyne', n: 'Athebyne', c: 'places', o: 3, g: 'fw', t: 'Outpost beyond the wards', rel: ['venin'], s: [['fw', "An outpost beyond the wards, the site of a trap in the War Games."]] },

      { id: 'samara', n: 'Samara', c: 'places', o: 3, g: 'if:4', t: "Xaden's post", rel: ['xaden', 'mira'], s: [['if:4', "An outpost with an operations centre, where Xaden is posted."], ['if:5', "Mira is stationed there too."]] },

      // ---------- history and lore ----------
      { id: 'rebellion', n: 'The Tyrrish rebellion', c: 'lore', o: 1, g: 'fw:0', t: 'Fen Riorson’s uprising', rel: ['fen', 'marked', 'aretia'], s: [['fw:0', "An uprising led by Fen Riorson that tried to break away from Navarre. It ended with its leaders executed by Codagh's fire."], ['fw', "At the Battle of Aretia, Fen shot Brennan Sorrengail with a crossbolt."]] },
      { id: 'marked', n: 'The rebellion children', c: 'lore', o: 2, g: 'fw:0', t: 'Marked by relics', rel: ['relics', 'xaden', 'liam'], s: [['fw:0', "The children of the executed rebels, marked with rebellion relics."], ['fw', "There were a hundred and eight of them. Xaden, the eldest, made a deal with General Sorrengail: he answers for the other hundred and seven, and they may live and compete to become riders. He leads their meetings in secret."]] }
    ],
    trees: [
      { id: 'sorrengail', n: 'The Sorrengails', g: 'fw:0', p: [
          ['asher', 'Asher', 0, 0, { g: 'fw:0', t: 'Scribe', e: 'asher', x: 'fw:0' }], ['lilith', 'Lilith', 0, 1, { g: 'fw:0', t: 'General', e: 'lilith', x: 'if' }],
          ['brennan', 'Brennan', 1, 0, { g: 'fw:0', t: [['fw:0', 'Believed dead'], ['fw', 'Mender, Aretia']], e: 'brennan' }], ['mira', 'Mira', 1, 1, { g: 'fw:0', t: 'First Lieutenant', e: 'mira' }], ['violet', 'Violet', 1, 2, { g: 'fw:0', t: 'Rider', e: 'violet' }]],
        u: [['asher', 'lilith', '']], k: [['asher+lilith', 'brennan', ''], ['asher+lilith', 'mira', ''], ['asher+lilith', 'violet', '']], l: [] },
      { id: 'riorson', n: 'The Riorsons', g: 'fw:0', p: [
          ['fen', 'Fen Riorson', 0, 0, { g: 'fw:0', t: 'Led the rebellion', e: 'fen', x: 'fw:0' }], ['fsister', "Fen's sister", 0, 1, { g: 'fw:0', t: '' }],
          ['xaden', 'Xaden', 1, 0, { g: 'fw:0', t: 'Wingleader', e: 'xaden' }], ['bodhi', 'Bodhi Durran', 1, 1, { g: 'fw:0', t: 'Cousin', e: 'bodhi' }]],
        u: [], k: [['fen', 'xaden', ''], ['fsister', 'bodhi', '']], l: [['fen', 'fsister', 'siblings', 'fw:0']] }
    ],
    charts: [
      { id: 'pairs', n: 'Riders, dragons and signets', g: 'fw:0', type: 'table', note: 'Only what Fourth Wing shows.', cols: ['Rider', 'Dragon', 'Signet'], rows: [
          { c: ['Violet', [['fw', 'Tairn, black morningstartail; Andarna, golden feathertail']], [['fw', 'Lightning']]] },
          { c: ['Xaden', 'Sgaeyl, blue daggertail', 'Shadows'] },
          { c: ['Dain', 'Cath, red swordtail', [['fw', 'Retrocognition']]] },
          { c: ['Liam', 'Deigh, red daggertail', [['fw', 'Farsight']]] },
          { c: ['Rhiannon', [['fw', 'Feirge, green daggertail']], [['fw', 'Summoning']]] },
          { c: ['Ridoc', [['fw', 'Aotrom, brown swordtail']], [['fw', 'Ice']]] },
          { c: ['Sawyer', [['fw', 'Sliseag, red swordtail']], ''] },
          { c: ['Jack', [['fw', 'Baide, orange scorpiontail']], ''] },
          { c: ['Mira', [['fw', 'Teine, green clubtail']], [['fw', 'Extends the wards']]] },
          { c: ['Brennan', [['fw', 'Marbh, orange daggertail']], [['fw', 'Mending']]] },
          { c: ['Lilith', 'Aimsir, brown', 'Storms'] },
          { c: ['Melgren', 'Codagh, black swordtail', 'Sees how battles end'] }] },
      { id: 'dragons', n: 'Dragon colours', g: 'fw:0', type: 'cards', note: 'Tails are not tied to colour.', items: [
          { n: 'Black', sub: 'Tairn, Codagh', lines: [['fw:0', 'The rarest and the cleverest.']] }, { n: 'Blue', sub: 'Sgaeyl', lines: [['fw:0', 'Large and ruthless.']] },
          { n: 'Red', sub: 'Cath, Deigh, Sliseag', lines: [['fw:0', 'The quickest temper. Cadets are told not to meet their eyes.']] }, { n: 'Orange', sub: 'Baide', lines: [['fw:0', 'Unpredictable, for their rider or against.']] },
          { n: 'Brown', sub: 'Aotrom, Aimsir', lines: [['fw:0', 'Loyal. Cadets are told not to show them fear.']] }, { n: 'Green', sub: 'Feirge, Teine', lines: [['fw:0', 'The most rational, with the steadiest hold on magic.']] },
          { n: 'Gold feathertail', sub: 'Andarna', lines: [['fw', 'Small, cannot breathe fire.']] }] },
      { id: 'structure', n: 'The Riders Quadrant', g: 'fw:0', type: 'cards', note: 'Four wings, three sections each, three squads in each section.', items: [
          { n: 'Wing', sub: 'Led by a third-year wingleader', lines: [['fw:0', 'Four of them: First, Second, Third and Fourth Wing. Xaden leads Fourth.']] },
          { n: 'Section', sub: 'Flame, claw or tail', lines: [['fw:0', 'Three to a wing, each led by a third-year section leader.']] },
          { n: 'Squad', sub: 'Three to a section', lines: [['fw:0', 'Led by a squad leader. First-years sit in the back two rows.']] }] }
    ]
  });
})();
