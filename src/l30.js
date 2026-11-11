// ===== L30: Encyclopedia data — The Stormlight Archive. Gates: wok:N = through Part N of The Way of Kings; a bare key = that book finished.
(function () { if (!window.L29) return;
  L29.add({ k: 'stormlight', n: 'The Stormlight Archive', short: 'Stormlight', world: 'Roshar', by: 'Brandon Sanderson', skin: 'storm', spines: ['#2f5d8f', '#a13a2e', '#3f7a55', '#b08a3e', '#2f7f86', '#5b4a8c', '#c26a2e'], acc: '#7fb8db', hue: ['#1d3a52', '#0a141d'], badge: 'Scholar of the Palanaeum',
    about: [['', "Roshar is a world of stone scoured by highstorms. The Knights Radiant who once defended it are remembered as traitors, and their Shardblades and Shardplate are now the prizes that wars are fought over."]],
    src: [['Coppermind', 'https://coppermind.net/wiki/The_Stormlight_Archive']],
    books: [
      { k: 'wok', t: 'The Way of Kings', m: '^The Way of Kings', dp: 1, chs: 75, ch: [11, 28, 51, 67, 75], parts: ['Above Silence', 'The Illuminating Storms', 'Dying', "Storm's Illumination", 'The Silence Above'] },
      { k: 'wor', t: 'Words of Radiance', m: '^Words of Radiance' },
      { k: 'edg', t: 'Edgedancer', m: '^Edgedancer' },
      { k: 'ob', t: 'Oathbringer', m: '^Oathbringer' },
      { k: 'daw', t: 'Dawnshard', m: '^Dawnshard' },
      { k: 'row', t: 'Rhythm of War', m: '^Rhythm of War' },
      { k: 'wat', t: 'Wind and Truth', m: '^Wind and Truth' }],
    cats: { people: 'People', groups: 'Houses & Factions', powers: 'Powers & Magic', places: 'Places', lore: 'History & Lore', things: 'Creatures & Things' },
    e: [
      // ---- people
      { id: 'kaladin', n: 'Kaladin', c: 'people', o: 1, g: 'wok:0', t: [['wok:0', 'Spearman, called Stormblessed'], ['wok:1', 'Bridgeman of Bridge Four'], ['wok', "Captain of Dalinar's guard"], ['wor', 'Windrunner']], rel: ['syl', 'bridge4', 'lirin', 'tien', 'amaram', 'sadeas'], s: [
        ['wok:0', "A darkeyed spearman and squad leader in Brightlord Amaram's army. His men called him Stormblessed because the squad that fought beside him tended to come home alive."],
        ['wok:1', "Now a slave with the shash glyph, 'dangerous', branded on his forehead. Sold to Highprince Sadeas's army, he was put on Bridge Four, the crew that loses the most men. His father, Lirin, trained him as a surgeon in the town of Hearthstone, and he carries the memory of his younger brother, Tien."],
        ['wok:1', "At the edge of the Honor Chasm he chose to keep going. He bought control of Bridge Four from the sergeant, Gaz, learned his men's names, and set out to keep them alive."],
        ['wok:2', "He drills the crew until they run as a unit, treats the wounded the army would leave on the plateaus, and wins the men over a few at a time, Rock and Teft first."],
        ['wok:3', "On one run he had the crew carry the bridge sideways as a shield. It saved his men and lost Sadeas the battle. Kaladin was hung out in a highstorm as punishment and lived through it. Teft told him why: he has been drawing in Stormlight without knowing it."],
        ['wok:3', "His past, in order. The citylord Roshone had Tien conscripted out of spite, and Kaladin enlisted to protect him. Years later he killed a Shardbearer to save Amaram and refused the Blade and Plate. Amaram murdered his squad, took the Shards for himself and branded Kaladin a slave."],
        ['wok', "At the Tower, Sadeas pulled his bridges and left Dalinar's army to die. Kaladin spoke the Second Ideal, 'I will protect those who cannot protect themselves', and took Bridge Four back across. Dalinar bought every bridgeman's freedom with his Shardblade and made Kaladin captain of his guard."],
        ['wor', "Syl is an honorspren, and their bond makes him a Windrunner: he Lashes himself into the sky and heals with Stormlight. He nearly killed the bond by standing aside while Moash plotted to kill the king. He mended it with the Third Ideal, to protect even those he hates, and Syl became his Shardblade. He fought Szeth in the storm above the Shattered Plains and won."],
        ['ob', "He flew home to Hearthstone and found his parents alive, with a baby brother, Oroden. In Kholinar he froze when men he cared about on both sides killed each other and Elhokar died in front of him. He crossed Shadesmar to reach Thaylen City and could not bring himself to say the Fourth Ideal."],
        ['row', "Battle shock took him off the front line. He went back to surgery in Urithiru and began treating other soldiers with the same wounds of the mind. When the tower was occupied he fought on alone. Moash killed Teft. Falling from the tower, Kaladin spoke the Fourth Ideal: he accepts that there will be those he cannot protect."],
        ['wat', "He travelled to Shinovar with Szeth and freed the mad Herald Ishar by speaking the Fifth Ideal. He became a Herald himself, in Jezrien's place, inside a new Oathpact that Ishar forged."]] },
      { id: 'shallan', n: 'Shallan Davar', c: 'people', o: 1, g: 'wok:0', t: [['wok:0', 'Would-be ward of Jasnah Kholin'], ['wor', 'Lightweaver']], rel: ['jasnah', 'kabsal', 'soulcasting', 'pattern', 'ghostbloods'], s: [
        ['wok:0', "A young lighteyed woman from Jah Keved who has chased Jasnah Kholin from port to port to ask to be her ward. She draws from memory: one blink fixes a scene in her mind and she can sketch it exactly later."],
        ['wok:1', "The wardship is a cover. Her father is dead, her family hides it, and House Davar is deep in debt. Their own Soulcaster is broken. Her plan is to get close to Jasnah, steal her Soulcaster and swap in the broken one. Jasnah turned her down, then accepted her after seeing her sketches and her nerve."],
        ['wok:3', "She made the swap. Then things stopped fitting: she cannot make the stolen Soulcaster work, figures with symbols for heads appear at the edges of her drawings, and once, speaking to a voice, she turned a goblet to blood. The ardent Kabsal, who courted her, was an assassin after Jasnah; his poisoned bread killed him and nearly killed Shallan."],
        ['wok', "Jasnah's Soulcaster was always a fake. Jasnah Soulcasts with no device, and so does Shallan. Shallan confessed, was taken back as a true student, and learned Jasnah's conclusion about the Voidbringers."],
        ['wor', "The symbol-headed creature is Pattern, a Cryptic, and their bond makes her a Lightweaver whose Ideals are truths about herself. Shipwrecked on the way to the Shattered Plains, she crossed the Frostlands, joined the Ghostbloods under a false face, and found the Oathgate that took the armies to Urithiru. The truth she had buried: as a child she killed her mother with a Shardblade, and later she killed her father."],
        ['ob', "She split herself into Veil and Radiant to cope. She faced the Unmade Re-Shephir under Urithiru, infiltrated Kholinar, and married Adolin after Thaylen Field."],
        ['row', "A third, harsher self, Formless, pressed at her. In Shadesmar she admitted the oldest truth: Pattern is her second spren. As a child she bonded a Cryptic named Testament and broke that bond, making Testament a deadeye."],
        ['wat', "She killed the Ghostblood leaders Iyatil and Mraize. She ends the book stranded in Shadesmar, cut off from Adolin."]] },
      { id: 'dalinar', n: 'Dalinar Kholin', c: 'people', o: 1, g: 'wok:0', t: [['wok:0', "The dead king's brother"], ['wok:1', 'Highprince, the Blackthorn'], ['wor', 'Bondsmith']], rel: ['adolin', 'gavilar', 'navani', 'sadeas', 'codes', 'stormfather'], s: [
        ['wok:0', "Brother of King Gavilar. Gavilar's dying message was for him: find the most important words a man can say."],
        ['wok:1', "Highprince of the Kholin princedom and uncle of King Elhokar. As the Blackthorn he was the most feared general in Alethkar. Now he follows the old Alethi Codes of War while the other highprinces treat the war as sport, and he has fits during highstorms that his son Adolin fears are a sign of weakness. A voice in them tells him to 'unite them'."],
        ['wok:2', "The fits are visions: he lives through moments of Roshar's deep past, guided by a voice. He has Gavilar's favourite book, The Way of Kings, read to him. He cannot remember his dead wife, not her face or her name. By the end of Part Two he doubts his own mind enough to consider stepping down for Adolin."],
        ['wok:4', "Navani recorded the old tongue he spoke during a vision and scholars confirmed it was real, so the visions are true. He made an alliance with Sadeas for joint plateau assaults."],
        ['wok', "Sadeas betrayed him at the Tower and left his army surrounded. Bridge Four came back for them. Dalinar gave his Shardblade, Oathbringer, to buy the bridgemen's freedom. The king named him Highprince of War. His last vision told him who the voice was: a recording left by the Almighty, who is dead."],
        ['wor', "He tried to unite the highprinces by decree and led the march to the centre of the Shattered Plains. He and Navani stopped hiding their courtship. At the end he spoke the words of a Bondsmith and bonded the Stormfather himself."],
        ['ob', "Based at Urithiru, he tried to bring the world's monarchs into a coalition. His missing past came back in pieces: the Blackthorn was a butcher, his wife was Evi, and she burned in the city of Rathalas when he ordered it torched. He had gone to the Nightwatcher to be rid of the grief, and Cultivation took the memories. At Thaylen Field, Odium offered to take the pain if Dalinar became his champion. Dalinar answered, 'You cannot have my pain,' and joined the three realms."],
        ['row', "He fought the war in Emul, learned what a Bondsmith can do from the Herald Ishar's example, and agreed to a contest of champions against Odium with the fate of Roshar on the terms."],
        ['wat', "He spent the last ten days searching the Spiritual Realm for a way to win. He took up Honor's power, then renounced it. Taravangian absorbed it and became Retribution. Dalinar died getting his grandson Gavinor out of the Everstorm."]] },
      { id: 'adolin', n: 'Adolin Kholin', c: 'people', o: 2, g: 'wok:1', t: [['wok:1', "Dalinar's heir, duelist"], ['ob', 'Highprince Kholin']], rel: ['dalinar', 'renarin', 'shallan', 'sadeas'], s: [
        ['wok:1', "Dalinar's elder son: a full Shardbearer, a famous duelist, and fond of fashion and short courtships. He loves his father and is afraid the highstorm fits will ruin the family's standing."],
        ['wok:4', "He argued his father should treat the visions as madness, then told him not to abdicate. He fought beside him at the Tower."],
        ['wor', "He duelled his way through the other camps to win Shards for his father, including one bout against four Shardbearers at once. He was betrothed to Shallan Davar through a causal arranged by Jasnah. At the end, alone in a corridor of Urithiru, he killed Sadeas."],
        ['ob', "He confessed the killing in time. In Shadesmar he met the dead spren of his own Shardblade, Mayalaran, and began treating her as a person. He refused the crown of Alethkar and married Shallan."],
        ['row', "He went to the honorspren fortress of Lasting Integrity and stood trial for humanity's crimes at the Recreance. Maya spoke: the spren had chosen to die with their Radiants. It was the first time a deadeye had come back that far."],
        ['wat', "He defended Azimir with no Radiant powers and lost a leg doing it. Maya came back at the head of the deadeyes to fight, and he founded the Unoathed."]] },
      { id: 'jasnah', n: 'Jasnah Kholin', c: 'people', o: 2, g: 'wok:0', t: [['wok:0', 'Scholar, heretic, sister of the king'], ['wor', 'Elsecaller'], ['ob', 'Queen of Alethkar']], rel: ['shallan', 'soulcasting', 'gavilar', 'voidbringers'], s: [
        ['wok:0', "Daughter of King Gavilar and sister of King Elhokar, and the most famous scholar alive. She is openly an atheist, which the Vorin church calls heresy. She carries a Soulcaster, a rare thing outside the church and the crown."],
        ['wok:1', "She researches in the Palanaeum of Kharbranth and took Shallan as a ward after first refusing her. She holds students to a hard standard in history and philosophy."],
        ['wok:3', "She walked Shallan into a dark alley, drew out four footpads and killed them with Soulcasting, then asked Shallan whether it had been right. Her research is the Voidbringers and the city of Urithiru."],
        ['wok', "Her Soulcaster is a decoy. She Soulcasts by reaching into Shadesmar herself. Her conclusion from the old records: the Voidbringers never left. They are the parshmen."],
        ['wor', "She was stabbed aboard the Wind's Pleasure and presumed dead. She had escaped into Shadesmar: she is an Elsecaller, bonded to the inkspren Ivory, and she walked back out in the epilogue."],
        ['ob', "She returned to Urithiru and was crowned Queen of Alethkar after her brother's death."],
        ['row', "As queen she freed Alethkar's slaves and fought on the front line in Emul. She grew close to Wit."],
        ['wat', "She debated Odium for the loyalty of Thaylenah and lost. Queen Fen went over to him."]] },
      { id: 'szeth', n: 'Szeth', c: 'people', o: 2, g: 'wok:0', t: [['wok:0', 'The Assassin in White'], ['ob', 'Skybreaker']], rel: ['gavilar', 'lashings', 'taravangian', 'shinovar'], s: [
        ['wok:0', "Szeth-son-son-Vallano, Truthless of Shinovar. Truthless must obey whoever holds his Oathstone. Wearing white on his masters' orders, he killed King Gavilar with a Shardblade and with powers no one had seen in centuries: he breathes in Stormlight and Lashes himself and other things in any direction."],
        ['wok:1', "After the killing his Oathstone passed from hand to hand among people who had no idea what they owned. He can be ordered to do anything except take his own life."],
        ['wok', "A hidden master began sending him to kill rulers across Roshar. The trail ended in Kharbranth: the man holding his Oathstone is King Taravangian, who sent him next for Dalinar."],
        ['wor', "His Blade is an Honorblade, Jezrien's, which gives a Windrunner's powers to whoever holds it. He was named Truthless for saying the Radiant powers were returning, and Kaladin proved him right, which broke him. He died in the storm, and the Herald Nale revived him and handed him a black sword."],
        ['ob', "He trained with the Skybreakers carrying Nightblood, a talking sword that feeds on Investiture, and swore his Third Ideal to follow Dalinar. He fought for Dalinar at Thaylen Field."],
        ['wat', "He went home to Shinovar with Kaladin. The Voice that had corrupted his homeland was the Herald Ishar. Szeth fought the Honorbearers who held the Shin Honorblades, his own father and sister among them, and Nightblood cost him an arm."]] },
      { id: 'syl', n: 'Syl', c: 'people', o: 3, g: 'wok:1', t: [['wok:1', 'A windspren who follows Kaladin'], ['wor', 'Honorspren']], rel: ['kaladin', 'spren'], s: [
        ['wok:1', "A spren who took an interest in Kaladin and stayed. Windspren play tricks and forget; this one remembers his name, asks questions and is getting sharper the longer she is near him. She left when he lashed out at her and came back with a blackbane leaf at the Honor Chasm."],
        ['wok:3', "She is not a windspren and does not know what she is, only that she is bound to him and that it has something to do with honour. She hates Shardblades."],
        ['wor', "Sylphrena is an honorspren, the first to bond a human since the Recreance, against the Stormfather's wishes. The bond is what gives Kaladin his powers and gives her a mind in the Physical Realm. When he swore the Third Ideal she became a living Shardblade that takes any shape he needs."],
        ['row', "The Stormfather is her father in the way spren reckon it. An earlier Radiant of hers died long ago."]] },
      { id: 'elhokar', n: 'Elhokar Kholin', c: 'people', g: 'wok:0', t: 'King of Alethkar', rel: ['gavilar', 'dalinar', 'jasnah'], s: [
        ['wok:0', "Gavilar's son, king since the assassination. He led the highprinces to the Shattered Plains under the Vengeance Pact to punish the Parshendi."],
        ['wok:1', "Young, sure that assassins are after him, and reliant on his uncle Dalinar and on Sadeas. On a chasmfiend hunt his saddle girth broke, and he took it as an attempt on his life."],
        ['wok', "He cut the girth himself to force an investigation. He made Dalinar Highprince of War."],
        ['wor', "He sees shapes with symbols for heads in mirrors. He asked Kaladin how to be a king men would follow."],
        ['ob', "He went to free Kholinar and save his wife and son. He was partway through the First Ideal when Moash killed him."]] },
      { id: 'gavilar', n: 'Gavilar Kholin', c: 'people', g: 'wok:0', t: 'King of Alethkar, killed in the prologue', rel: ['dalinar', 'szeth', 'jasnah', 'elhokar'], s: [
        ['wok:0', "The king who united the ten warring Alethi princedoms. He was killed by Szeth on the night of a treaty feast with the Parshendi, who then claimed the killing. Dying, he gave Szeth a black sphere and a message for his brother Dalinar."],
        ['wok:2', "In his last years he changed: he took up the Codes and an old book called The Way of Kings, and he spoke of uniting people by something other than the sword."],
        ['wor', "He was working with a secret group, the Sons of Honor, who wanted to bring back the Heralds by bringing back the Voidbringers. He told the Parshendi leaders he meant to return their gods, which is why they had him killed."],
        ['row', "He was experimenting with strange Lights held in spheres, and on the last night of his life he told Navani exactly how little he thought of her."], ['wat', "He meant to make himself immortal as a Herald."]] },
      { id: 'navani', n: 'Navani Kholin', c: 'people', g: 'wok:1', t: [['wok:1', "The king's mother, artifabrian"], ['ob', 'Queen of Urithiru'], ['row', 'Bondsmith']], rel: ['dalinar', 'gavilar', 'fabrials'], s: [
        ['wok:1', "Gavilar's widow and Elhokar's mother. She is a patron of fabrial science and a formidable court politician."],
        ['wok:2', "She came back to the warcamps uninvited and made her interest in Dalinar plain. He held her off for the sake of propriety and his brother's memory."], ['wok:4', "She recorded the old tongue he spoke in a vision and had it verified."],
        ['wor', "She and Dalinar courted in the open."],
        ['ob', "She married Dalinar, with the Stormfather himself witnessing the oath."],
        ['row', "When the Fused took Urithiru she kept working as a prisoner, trading research with the Fused scholar Raboniel. She found that each kind of Light has an opposite that destroys it, and she bonded the tower's spren, the Sibling, becoming a Bondsmith."]] },
      { id: 'renarin', n: 'Renarin Kholin', c: 'people', g: 'wok:1', t: [['wok:1', "Dalinar's younger son"], ['wor', 'Truthwatcher']], rel: ['dalinar', 'adolin'], s: [
        ['wok:1', "Dalinar's younger son. A blood weakness gives him fits and has kept him from training as a soldier, in a country that honours little else. He is quiet and watchful and always carries a small box."],
        ['wor', "He was given a Shardblade and joined Bridge Four to learn to fight. The Blade screams when he holds it. He sees the future, which Vorinism calls the work of the Voidbringers. He told his family he is a Truthwatcher."],
        ['ob', "His spren, Glys, was changed by the Unmade Sja-anat, which is why his visions differ from an ordinary Truthwatcher's. One of them showed Jasnah killing him. She chose not to, and the future turned out to be changeable."]] },
      { id: 'sadeas', n: 'Torol Sadeas', c: 'people', g: 'wok:1', t: 'Highprince, master of the bridge crews', rel: ['dalinar', 'kaladin', 'bridge4'], s: [
        ['wok:1', "Highprince of the Sadeas princedom. His army wins gemhearts faster than any other because its bridges are carried by unarmoured slaves who draw the Parshendi arrows. He was Gavilar's friend and Dalinar's comrade in the wars of unification."],
        ['wok:2', "The king named him Highprince of Information to look into the cut saddle girth."],
        ['wok:4', "He cleared Dalinar of the girth affair in front of the court and agreed to joint plateau assaults."],
        ['wok', "The alliance was the trap. At the Tower he withdrew and left Dalinar's army surrounded. He told Dalinar afterwards that he had done it for Alethkar."],
        ['wor', "He worked against Dalinar's every decree. Adolin killed him in Urithiru."]] },
      { id: 'wit', n: 'Wit', c: 'people', g: 'wok:1', t: "The King's Wit", s: [
        ['wok:1', "The king's jester, whose office is to insult anyone at court on the king's behalf. He spares Dalinar and Renarin. Elsewhere he goes by Hoid, the name three foreigners were asking after in the Purelake."],
        ['wok', "He told Kaladin the story of Derethil and the Wandersail and gave him a flute. On the night Talenel arrived at the gates of Kholinar, Wit was there waiting."],
        ['ob', "He is far older than Roshar's history and travels between worlds. In Kholinar he bonded a Cryptic."],
        ['row', "He and Jasnah became a couple. Odium found him and took some of his memories without his knowing."]] },
      { id: 'amaram', n: 'Meridas Amaram', c: 'people', g: 'wok:0', t: [['wok:0', "Brightlord, Kaladin's old commander"], ['wok:3', 'Shardbearer by theft']], rel: ['kaladin', 'sadeas'], s: [
        ['wok:0', "A brightlord in Sadeas's princedom with a reputation as the most honourable general in Alethkar. Kaladin served in his army."],
        ['wok:3', "Kaladin killed a Shardbearer to save him and gave up the Shards. Amaram had Kaladin's men killed so no one could say who really won them, kept the Blade and Plate, and sold Kaladin as a slave, saying the kingdom needed the Shards in trained hands."],
        ['wor', "He is one of the Sons of Honor. Dalinar tested him, exposed the theft in front of the highprinces, and still he rose to lead what was left of the order."],
        ['ob', "He took command of the Sadeas princedom, gave himself to Odium at Thaylen Field, swallowed a gemstone holding an Unmade, and died fighting Kaladin."]] },
      { id: 'taravangian', n: 'Taravangian', c: 'people', g: 'wok:1', t: [['wok:1', 'King of Kharbranth'], ['row', 'Odium']], rel: ['szeth', 'deathrattles', 'kharbranth'], s: [
        ['wok:1', "The elderly king of Kharbranth, kindly and thought a little slow. He pays for the city's hospitals and lets Jasnah use the Palanaeum."],
        ['wok', "He is the one sending Szeth to kill the world's rulers. In his hospitals the dying are bled out so their last words, the death rattles, can be written down."],
        ['wor', "He asked the Nightwatcher for the capacity to save humankind. Now his mind changes daily: on some days brilliant and without compassion, on others kind and dull. On his most brilliant day he wrote the Diagram, a plan his followers obey. He became king of Jah Keved as well."],
        ['ob', "He joined Dalinar's coalition and betrayed it. He bargained with Odium to spare Kharbranth alone."],
        ['row', "On a brilliant day, with Nightblood in reach, he killed the being that held the Shard of Odium and took the power himself."]] },
      { id: 'teft', n: 'Teft', c: 'people', g: 'wok:2', t: 'Bridge Four', rel: ['bridge4', 'kaladin'], s: [
        ['wok:2', "An older bridgeman with a sergeant's manner. One of the first two to follow Kaladin."],
        ['wok:3', "He grew up among the Envisagers, a sect that tried to bring back the Radiants, and he recognised what Kaladin was doing with Stormlight. He taught him the First Ideal."],
        ['ob', "He fought an addiction to firemoss, bonded an honorspren, and swore his Third Ideal by forgiving himself."],
        ['row', "Moash killed him in Urithiru."]] },
      { id: 'rock', n: 'Rock', c: 'people', g: 'wok:2', t: 'Bridge Four', rel: ['bridge4'], s: [
        ['wok:2', "A huge Horneater from the Peaks whose full name, Numuhukumakiaki'aialunamor, is a poem. He will cook and carry but will not fight. He can see spren that hide from other people, and he was one of the first two to follow Kaladin."],
        ['wok:3', "He came down from the Horneater Peaks as servant to a lord who challenged Sadeas for his Shards and lost. Sadeas claimed the servants. Rock would not fight, so he was sent to the bridges."],
        ['ob', "To save Kaladin he broke his own law and drew a bow, killing Amaram."]] },
      { id: 'moash', n: 'Moash', c: 'people', g: 'wok:2', t: [['wok:2', 'Bridge Four'], ['row', 'Vyre']], rel: ['bridge4', 'kaladin', 'elhokar'], s: [
        ['wok:2', "A hawk-faced bridgeman, the last to come around to Kaladin and then among the most loyal."],
        ['wor', "Elhokar once let Moash's grandparents die in prison as a favour to Roshone. Moash joined a plot to kill the king and drew Kaladin into it. Kaladin stood against him at the end."],
        ['ob', "He went over to the Fused. He killed Elhokar in Kholinar and then, on their orders, the Herald Jezrien."],
        ['row', "The enemy calls him Vyre. Odium takes his pain, so he feels nothing. He killed Teft."]] },
      { id: 'lirin', n: 'Lirin', c: 'people', g: 'wok:1', t: "Surgeon of Hearthstone, Kaladin's father", rel: ['kaladin', 'tien'], s: [
        ['wok:1', "A darkeyed surgeon of the second nahn in Hearthstone. He wanted his son trained in Kharbranth and told him that trying to save lives by killing is like trying to stop a storm by blowing harder."],
        ['wok:3', "He kept spheres the old citylord meant for the town, to pay for Kaladin's training. The new citylord, Roshone, starved the family out over it and had Tien conscripted."],
        ['ob', "Alive in occupied Hearthstone with his wife Hesina and a new son, Oroden."],
        ['row', "He treated the wounded of both sides in Urithiru and fought bitterly with Kaladin over resistance, then accepted him."]] },
      { id: 'tien', n: 'Tien', c: 'people', g: 'wok:1', t: "Kaladin's younger brother", rel: ['kaladin', 'lirin'], s: [
        ['wok:1', "Kaladin's little brother, the one person who could always lift his mood. Kaladin could not protect him, and boys who remind him of Tien are the ones he cannot stand to lose."],
        ['wok:3', "Roshone had him conscripted at thirteen. Kaladin enlisted the same day to keep him safe."],
        ['wok', "He was used as bait in his first real battle, a messenger boy put in the line to slow the enemy. Kaladin reached him too late."]] },
      { id: 'kabsal', n: 'Kabsal', c: 'people', g: 'wok:1', t: 'Ardent of Kharbranth', rel: ['shallan', 'jasnah'], s: [
        ['wok:1', "A young ardent who visits the Palanaeum hoping to argue Jasnah back into the faith, and who brings Shallan bread and jam."],
        ['wok:3', "He was an assassin. The bread was poisoned and the jam held the antidote, which Jasnah never ate. He died of his own poison."],
        ['wor', "He worked for the Ghostbloods."]] },
      { id: 'lopen', n: 'The Lopen', c: 'people', g: 'wok:3', t: 'Bridge Four', rel: ['bridge4'], s: [
        ['wok:3', "A one-armed Herdazian who talked his way onto Bridge Four as a water carrier, and who has a cousin for every job."],
        ['wor', "He learned to hold Stormlight, and his missing arm began to grow back."], ['ob', "He became a Windrunner, a squire first and then bonded to a spren of his own."]] },
      { id: 'sigzil', n: 'Sigzil', c: 'people', g: 'wok:3', t: 'Bridge Four', rel: ['bridge4', 'wit'], s: [
        ['wok:3', "An Azish bridgeman trained as a Worldsinger, someone who travels to teach peoples about one another."], ['wok', "His old master was Hoid."], ['wat', "He renounced his oaths to save his spren, and left Roshar on an errand for Wit."],
        ['row', "He led the Windrunners in the field."]] },
      { id: 'eshonai', n: 'Eshonai', c: 'people', g: 'wok', t: [['wok', 'Parshendi Shardbearer'], ['wor', 'General of the listeners']], rel: ['parshendi', 'forms'], s: [
        ['wok', "The Parshendi Shardbearer who fought Dalinar on the Tower and seemed to want to speak with him."],
        ['wor', "The last Shardbearer of her people, who call themselves the listeners. She was the explorer who first met the Alethi. To save what is left of the listeners she took stormform, and the form's god took her will."],
        ['ob', "She died in the chasms after the battle of Narak."]] },
      { id: 'venli', n: 'Venli', c: 'people', g: 'wor', t: [['wor', "Eshonai's sister, scholar"], ['row', 'Willshaper']], rel: ['eshonai', 'forms'], s: [
        ['wor', "Eshonai's sister, a scholar who recovered the old forms of power."],
        ['ob', "She became the mouthpiece of the Fused, saw what Odium does with her people's bodies, and secretly bonded a spren named Timbre."],
        ['row', "She swore the oaths of a Willshaper inside occupied Urithiru and found that some of her people had survived."]] },
      { id: 'lift', n: 'Lift', c: 'people', g: 'wor', t: 'Edgedancer', s: [
        ['wor', "A street thief who broke into the palace of Azir to steal dinner. She turns food into Stormlight, slides as if the ground were greased, and heals others. Her spren, Wyndle, grows as a vine."],
        ['edg', "She went to Yeddaw, tracked down the Herald Nale as he hunted new Radiants, and swore to listen to those who have been ignored."]] },
      { id: 'pattern', n: 'Pattern', c: 'people', g: 'wor', t: "Shallan's Cryptic", rel: ['shallan'], s: [
        ['wor', "A Cryptic, a spren that looks like a shifting geometric design and is drawn to lies and truths. He hums, takes everything literally, and can unlock doors."]] },
      { id: 'stormfather', n: 'The Stormfather', c: 'people', g: 'wok:0', t: [['wok:0', 'A name men swear by'], ['wor', 'Spren of the highstorms']], rel: ['highstorms', 'dalinar'], s: [
        ['wok:0', "The figure Rosharans picture at the head of the highstorm. Vorins use the name for Jezrien, king of the Heralds."],
        ['wor', "He is real: the greatest spren on Roshar, the highstorm itself, holding what remains of the dead god Honor. He sent Dalinar's visions on Honor's instruction. He bonded Dalinar unwillingly and will not be a sword."],
        ['wat', "He carried what was left of Honor's own mind. He died when Dalinar renounced Honor's power."]] },
      // ---- groups
      { id: 'bridge4', n: 'Bridge Four', c: 'groups', o: 1, g: 'wok:1', t: [['wok:1', "A bridge crew in Sadeas's camp"], ['wok', "Dalinar's guard"], ['wor', 'First of the new Windrunners']], rel: ['kaladin', 'teft', 'rock', 'moash', 'sadeas'], s: [
        ['wok:1', "Bridge crews carry mobile wooden bridges at a run so the army can cross the chasms of the Shattered Plains. They wear no armour and go in first, so the Parshendi shoot them and not the soldiers. Bridge Four has the worst losses of all."],
        ['wok:3', "Under Kaladin they wear carapace armour scavenged from the chasms, train with spears in secret, and salute each other with crossed wrists."],
        ['wok', "They went back for Dalinar's army at the Tower. Dalinar bought them free, and they became the core of his personal guard."],
        ['ob', "Bridgemen became squires and then Radiants themselves. The listener Rlain is one of them."]] },
      { id: 'kholin', n: 'House Kholin', c: 'groups', g: 'wok:0', t: 'The royal house of Alethkar', rel: ['gavilar', 'dalinar', 'elhokar', 'jasnah', 'adolin', 'renarin', 'navani'], s: [
        ['wok:0', "Gavilar Kholin made himself the first king of a united Alethkar in centuries. His son Elhokar wears the crown now."],
        ['wok:1', "The family colour is blue and its glyphpair is a tower and a crown. Dalinar holds the Kholin princedom, and his warcamp is the most disciplined on the Plains."]] },
      { id: 'highprinces', n: 'The Highprinces', c: 'groups', g: 'wok:1', t: 'The ten rulers of Alethkar under the king', rel: ['sadeas', 'dalinar'], s: [
        ['wok:1', "Alethkar is ten princedoms: Kholin, Sadeas, Aladar, Roion, Thanadal, Vamah, Ruthar, Bethab, Hatham and Sebarial. Each highprince keeps his own army and his own warcamp on the Shattered Plains, and they race one another for gemhearts more than they fight the Parshendi together."]] },
      { id: 'radiants', n: 'The Knights Radiant', c: 'groups', o: 1, g: 'wok:0', t: [['wok:0', 'The Lost Radiants'], ['wor', 'Ten orders, refounded']], rel: ['heralds', 'recreance', 'ideals', 'shards'], s: [
        ['wok:0', "Orders of knights founded to defend Roshar. Vorin teaching says they turned on mankind, and people now call them the Lost Radiants. The Shardblades and Shardplate that survive were theirs."],
        ['wok:4', "Dalinar saw them in his visions: men and women in glowing Plate who healed, flew and fought monsters, and who were held to standards by their orders. He heard two orders named, the Windrunners and the Stonewards."],
        ['wok', "Their oaths are the Immortal Words. The first is shared by every order: 'Life before death. Strength before weakness. Journey before destination.'"],
        ['wor', "There were ten orders, each bonded to a kind of spren and each holding two of the ten Surges. A Radiant advances by swearing further Ideals, and the spren becomes the Blade. The orders are returning one bond at a time."]] },
      { id: 'heralds', n: 'The Heralds', c: 'groups', g: 'wok:0', t: 'Ten champions of the Almighty', rel: ['oathpact', 'desolations', 'radiants'], s: [
        ['wok:0', "Ten men and women who led humankind through each Desolation and returned to a place of torment between them. In the Prelude, after the last one, nine of them walked away from their swords and their pact and left the tenth, Talenel, to bear it alone. Vorins pray to them now."],
        ['wok', "A man claiming to be Talenel collapsed at the gates of Kholinar in the epilogue."],
        ['wor', "The nine never died. They have lived on Roshar for some four and a half thousand years, and it has damaged them. Nale leads the Skybreakers and kills new Radiants; Shalash destroys her own images."],
        ['ob', "Their return to Braize was what held the enemy there. When Taln finally broke, the Desolation began. Moash killed Jezrien with a blade that traps the soul."]] },
      { id: 'vorinism', n: 'Vorinism', c: 'groups', g: 'wok:0', t: 'The church of the eastern kingdoms', s: [
        ['wok:0', "The faith of Alethkar, Jah Keved and their neighbours. It worships the Almighty and reveres the Heralds. Lighteyes rule and darkeyes serve. Reading and scholarship are women's arts and war is a man's; women keep the left hand, the safehand, covered."],
        ['wok:1', "Its priests are ardents, who are owned by lighteyed lords and barred from holding property or power since an old war against the church. Each person is meant to choose a Calling and work at it for the afterlife. Seeing the future is forbidden as a thing of the Voidbringers."]] },
      { id: 'parshendi', n: 'The Parshendi', c: 'groups', g: 'wok:0', t: [['wok:0', 'The people who killed the king'], ['wor', 'The listeners']], rel: ['parshmen', 'eshonai', 'forms'], s: [
        ['wok:0', "A people of the east with marbled red-and-black or red-and-white skin, discovered by the Alethi only a few years before the story. They signed a treaty with Gavilar, had him killed that night, and took the blame openly."],
        ['wok:1', "They fight in pairs, grow their own armour, leap chasms the Alethi need bridges for, and sing in unison even when far apart."],
        ['wor', "They call themselves listeners. Long ago their ancestors gave up every form of power to escape their gods, and they killed Gavilar because he meant to bring those gods back."]] },
      { id: 'parshmen', n: 'Parshmen', c: 'groups', g: 'wok:0', t: 'The docile servants of Roshar', rel: ['parshendi', 'voidbringers'], s: [
        ['wok:0', "Marble-skinned servants found in every household that can afford them. They do what they are told, rarely speak, and care only for their dead. They look like kin to the Parshendi."],
        ['wok', "Jasnah's finding: the old records describe the Voidbringers in the same words used for parshmen."],
        ['ob', "The Everstorm restored their minds. They were a people enslaved by having their connection to the world cut, and they woke to find themselves property."]] },
      { id: 'ghostbloods', n: 'The Ghostbloods', c: 'groups', g: 'wok', t: 'A secret society', rel: ['shallan', 'kabsal'], s: [
        ['wok', "The group Jasnah names as the ones who sent Kabsal. Shallan has seen their mark before, on a man who worked for her father."],
        ['wor', "Shallan's father had dealings with them, and her brothers owe them a Soulcaster. Shallan joined the cell in the warcamps under Mraize to learn what they know about Urithiru."],
        ['row', "They answer to someone from another world and want a way to carry Stormlight off Roshar."]] },
      { id: 'codes', n: 'The Alethi Codes of War', c: 'groups', g: 'wok:1', t: 'The old rules Dalinar keeps', rel: ['dalinar', 'gavilar'], s: [
        ['wok:1', "Rules for officers in the field: stay in uniform, do not drink on duty, do not duel for sport, ask nothing of your men you would not do. Gavilar followed them at the end of his life and Dalinar enforces them in his camp. The other highprinces think them a pose."]] },
      { id: 'fused', n: 'The Fused', c: 'groups', g: 'ob', t: 'The enemy returned', rel: ['parshmen', 'odium'], s: [
        ['ob', "The souls of ancient singers who return each Desolation by taking the bodies of living ones. There are several kinds, each with one Surge. Killing one only sends it back to be reborn in the next Everstorm."]] },
      // ---- powers
      { id: 'stormlight', n: 'Stormlight', c: 'powers', o: 1, g: 'wok:0', t: 'The energy the storms leave behind', rel: ['highstorms', 'lashings', 'spren'], s: [
        ['wok:0', "Highstorms charge cut gemstones with a glowing energy. Gems set in glass spheres are both the lamps and the money of Roshar; a sphere that has gone dark is 'dun'. Szeth breathed the Light in from spheres to fuel his Lashings, and it leaked from his skin like smoke."],
        ['wok:3', "A person holding Stormlight is stronger and faster and heals from wounds that should kill. It cannot be held for long."]] },
      { id: 'lashings', n: 'Lashings', c: 'powers', g: 'wok:0', t: 'Binding things with Stormlight', rel: ['stormlight', 'szeth'], s: [
        ['wok:0', "What Szeth did in the prologue. A Basic Lashing changes which way is down for a person or object. A Full Lashing sticks two things together until the Light runs out. A Reverse Lashing gives an object a pull of its own."],
        ['wor', "They are two of the ten Surges at work: Gravitation and Adhesion, the pair held by the Windrunners."]] },
      { id: 'shards', n: 'Shardblades and Shardplate', c: 'powers', o: 1, g: 'wok:0', t: 'Weapons of the Lost Radiants', rel: ['radiants'], s: [
        ['wok:0', "A Shardblade is a sword taller than a man that cuts stone and steel without resistance. Through living flesh it passes without a mark and kills what it touches: a limb goes grey and dead, and a cut through the spine burns out the eyes. The owner summons it from mist in ten heartbeats. Shardplate is powered armour that regrows from Stormlight. A man with both is worth an army, and whoever kills a Shardbearer takes the Shards."],
        ['wok:4', "In Dalinar's vision of the Recreance the Radiants drove their Blades into the ground and left their Plate, and the glow went out of them."],
        ['wor', "A Radiant's Blade is their spren. The Blades men carry now are the spren who were bonded when the oaths were broken, dead but not gone, and they scream at the touch of anyone who can hear them."]] },
      { id: 'soulcasting', n: 'Soulcasting', c: 'powers', g: 'wok:0', t: 'Turning one thing into another', rel: ['jasnah', 'shallan', 'essences'], s: [
        ['wok:0', "A Soulcaster is a fabrial worn on the hand, set with gemstones, that changes one substance into another: stone into smoke, air into grain. Armies eat because of them. Nearly all belong to the church and the crown."],
        ['wok', "It can be done without the device, by entering Shadesmar and persuading the thing to change."]] },
      { id: 'spren', n: 'Spren', c: 'powers', o: 1, g: 'wok:0', t: 'The living ideas of Roshar', rel: ['syl'], s: [
        ['wok:0', "Small spirits that appear around things and feelings: windspren on a breeze, flamespren in a fire, fearspren, painspren and gloryspren around people. Most are no smarter than insects."],
        ['wor', "Some are fully minds. They live in the Cognitive Realm and can only think clearly in the physical world by bonding a person, which is the trade at the heart of the Knights Radiant."]] },
      { id: 'highstorms', n: 'Highstorms', c: 'powers', g: 'wok:0', t: 'The storm that shapes the world', rel: ['stormlight', 'stormfather'], s: [
        ['wok:0', "A wall of wind and water that crosses Roshar from east to west every few days. Everything is built for it: towns sit in the lee of rock, plants pull into shells, and the east side of anything is called stormward. The storms leave gems charged and drop crem, a silt that hardens to stone."]] },
      { id: 'fabrials', n: 'Fabrials', c: 'powers', g: 'wok:1', t: 'Devices run on gemstones', rel: ['navani', 'soulcasting'], s: [
        ['wok:1', "Machines powered by Stormlight: heaters, alarms, spanreeds that let two pens write in step across any distance."],
        ['row', "A modern fabrial works by trapping a spren in a gemstone. The ancient ones, like Soulcasters and the Oathgates, were spren who chose to take that shape."]] },
      { id: 'essences', n: 'The Ten Essences', c: 'powers', g: 'wok:0', t: 'Vorin tens', s: [
        ['wok:0', "Vorin learning sorts the world by tens. Ten gemstones match ten Essences, the substances a Soulcaster can make, and each is tied to a part of the body and to a pair of virtues. The chart is under Charts."]] },
      { id: 'oldmagic', n: 'The Old Magic', c: 'powers', g: 'wok:2', t: 'A boon and a curse', rel: ['dalinar'], s: [
        ['wok:2', "In a valley in the west a being called the Nightwatcher grants any visitor one boon and one curse. Dalinar went. He will not say what he asked for."],
        ['ob', "Dalinar was met by Cultivation herself, who took his memories of his wife to let him grow into a different man before he had to face them."]] },
      { id: 'ideals', n: 'The Immortal Words', c: 'powers', g: 'wok:4', t: 'The oaths of the Radiants', rel: ['radiants'], s: [
        ['wok:4', "The First Ideal, which Teft taught Kaladin: 'Life before death. Strength before weakness. Journey before destination.'"],
        ['wok', "Each order had four more. Kaladin spoke a Second: 'I will protect those who cannot protect themselves.'"],
        ['wor', "The words are accepted or refused by the spren, and each one deepens the bond. Betraying them strains it, and breaking them kills the spren."]] },
      { id: 'forms', n: 'Forms and Rhythms', c: 'powers', g: 'wor', t: "The listeners' gift", rel: ['parshendi', 'eshonai'], s: [
        ['wor', "A listener changes form by taking a spren into the gemheart during a highstorm: warform, workform, nimbleform, mateform. They speak to rhythms everyone of their kind can hear. Stormform is one of the old forms of power, and its spren belong to their gods."]] },
      { id: 'oathpact', n: 'The Oathpact', c: 'powers', g: 'wok:0', t: "The Heralds' bargain", rel: ['heralds', 'desolations'], s: [
        ['wok:0', "The pact that bound the ten Heralds. In the Prelude they decide to tell people it still holds, with only Talenel left inside it."],
        ['ob', "It sealed the enemy on Braize for as long as every Herald there could bear torture without yielding. Each time one broke, a Desolation started."]] },
      // ---- places
      { id: 'roshar', n: 'Roshar', c: 'places', o: 1, g: 'wok:0', t: 'The world', rel: ['highstorms'], s: [
        ['wok:0', "One great continent swept by highstorms from the east. Life has adapted: grass retreats into the ground, trees fold their leaves, and most animals are shelled like crabs. Only Shinovar in the far west, sheltered by mountains, has soil, grass that stays put, horses and chickens."]] },
      { id: 'alethkar', n: 'Alethkar', c: 'places', g: 'wok:0', t: 'Kingdom of the Alethi', rel: ['kholin', 'highprinces'], s: [
        ['wok:0', "The largest Vorin kingdom, ten princedoms that fought each other until Gavilar forced them under one crown. War is the Alethi calling. The capital is Kholinar."]] },
      { id: 'plains', n: 'The Shattered Plains', c: 'places', o: 1, g: 'wok:1', t: 'Where the war is fought', rel: ['bridge4', 'gemhearts', 'highprinces'], s: [
        ['wok:1', "A tableland in the east broken into thousands of plateaus by deep chasms. The Parshendi hold the centre. The ten Alethi warcamps sit in craters on the western edge, and after six years they are small cities. Battles are races to plateaus where a chasmfiend has made its chrysalis."]] },
      { id: 'kharbranth', n: 'Kharbranth', c: 'places', g: 'wok:0', t: 'The City of Bells', rel: ['taravangian', 'jasnah'], s: [
        ['wok:0', "A free city built into a sheltered cliff face. It holds the Palanaeum, the greatest library on Roshar, and hospitals that treat anyone without charge."]] },
      { id: 'jahkeved', n: 'Jah Keved', c: 'places', g: 'wok:0', t: "Shallan's homeland", s: [
        ['wok:0', "The Vorin kingdom west of Alethkar and its old rival. House Davar is a minor rural house there."]] },
      { id: 'shinovar', n: 'Shinovar', c: 'places', g: 'wok:0', t: "Szeth's homeland", rel: ['szeth'], s: [
        ['wok:0', "The far western land behind the mountains where the highstorms arrive weak. The Shin hold farmers highest and warriors lowest, and they will not walk on stone."]] },
      { id: 'urithiru', n: 'Urithiru', c: 'places', g: 'wok:4', t: [['wok:4', 'The lost city of the Radiants'], ['wor', 'The tower city']], rel: ['radiants', 'jasnah'], s: [
        ['wok:4', "The seat of the Knights Radiant in the old stories. No one knows where it stood."], ['wok', "Jasnah believes it is real and is hunting for it. She thinks the way there starts on the Shattered Plains."],
        ['wor', "A tower of a hundred tiers high in the western mountains, reached by Oathgates, platforms in ten cities that swap places with the tower's own. Shallan opened the one on the Shattered Plains."],
        ['row', "The tower is the body of a spren, the Sibling, which once made its own Light and kept the place warm and defended."]] },
      { id: 'shadesmar', n: 'Shadesmar', c: 'places', g: 'wok', t: 'The Cognitive Realm', rel: ['soulcasting', 'spren'], s: [
        ['wok', "A place of black sky and a sea of glass beads, one bead for every object in the world. Shallan fell into it when she Soulcast."],
        ['ob', "It is where spren live, with their own cities and ships. Land and sea are reversed there: the beads lie where the world has ground, and solid footing where it has water."]] },
      { id: 'hearthstone', n: 'Hearthstone', c: 'places', g: 'wok:1', t: "Kaladin's home town", rel: ['lirin', 'kaladin'], s: [
        ['wok:1', "A farming town in northern Alethkar, in Sadeas's princedom, where Lirin is the surgeon."]] },
      // ---- lore
      { id: 'desolations', n: 'The Desolations', c: 'lore', o: 1, g: 'wok:0', t: 'The wars before history', rel: ['heralds', 'voidbringers', 'oathpact'], s: [
        ['wok:0', "Cycles of war against the Voidbringers, each so ruinous that civilisation had to start over. The Heralds told people the last one, some four and a half thousand years ago, was the final victory."],
        ['wok', "The last words of the recording in Dalinar's visions: the Desolation is coming again."]] },
      { id: 'voidbringers', n: 'The Voidbringers', c: 'lore', g: 'wok:0', t: 'The enemy in the old stories', rel: ['desolations', 'parshmen'], s: [
        ['wok:0', "The monsters of the Desolations. To most people they are a children's tale and a curse word."],
        ['wok', "Jasnah's conclusion: they were the parshmen."],
        ['ob', "The truth the Radiants could not live with: the singers were Roshar's first people. Humans came from another world they had destroyed, and they were the invaders."]] },
      { id: 'recreance', n: 'The Recreance', c: 'lore', g: 'wok:2', t: 'The day the Radiants quit', rel: ['radiants', 'shards'], s: [
        ['wok:2', "Vorin history says the Knights Radiant betrayed mankind on one day, the Day of Recreance."],
        ['wok:4', "Dalinar watched it in a vision: hundreds of Radiants walked out of a fortress, left their Blades and Plate on the field and went away without a word, and ordinary men ran to claim the Shards."],
        ['ob', "They had learned that humans were the invaders on Roshar and feared their powers would destroy this world as they had the last."],
        ['row', "The spren agreed to it. They chose to die with the oaths."]] },
      { id: 'reckoning', n: 'The Vengeance Pact', c: 'lore', g: 'wok:0', t: 'Why the armies are on the Plains', rel: ['gavilar', 'parshendi', 'plains'], s: [
        ['wok:0', "After Gavilar's murder the ten highprinces swore to destroy the Parshendi and chased them to the Shattered Plains. That was six years ago."],
        ['wok:1', "The war has turned into a contest for gemhearts, which makes the highprinces rich and gives no one a reason to end it."]] },
      { id: 'wokbook', n: 'The Way of Kings (the book)', c: 'lore', g: 'wok:2', t: "Gavilar's favourite book", rel: ['dalinar', 'gavilar'], s: [
        ['wok:2', "Forty parables on leadership written by an ancient king, Nohadon, who walked from one city to another to learn what his people's lives were like. The Radiants held to it. In modern Alethkar it is thought soft, and men do not read, so Dalinar has it read to him."]] },
      { id: 'deathrattles', n: 'Death Rattles', c: 'lore', g: 'wok:0', t: 'Last words of the dying', rel: ['taravangian'], s: [
        ['wok:0', "The lines that open each chapter of Part One are the final words of dying people, each noted with a date and a description of the speaker. Someone is collecting them."],
        ['wok', "Taravangian's hospitals collect them. The dying have begun to speak of things to come."],
        ['wor', "They are caused by one of the Unmade, and Taravangian uses them to correct the Diagram."]] },
      { id: 'almighty', n: 'The Almighty', c: 'lore', g: 'wok:0', t: [['wok:0', 'God of the Vorin church'], ['wor', 'Honor']], rel: ['vorinism', 'heralds'], s: [
        ['wok:0', "The god the Vorin kingdoms worship, said to have made the Heralds and to wait in the Tranquiline Halls."],
        ['wok', "The voice in Dalinar's visions is his, recorded before his death. He says he has been killed, and names the one who did it: Odium."],
        ['wor', "His name was Honor. He was one of three powers on Roshar, with Cultivation and Odium."]] },
      { id: 'odium', n: 'Odium', c: 'lore', g: 'wok', t: 'The enemy behind the Desolations', rel: ['almighty', 'fused'], s: [
        ['wok', "The name the dead god gives his killer."],
        ['ob', "A god of hatred who calls it passion. Honor's last act holds him to Roshar's system."],
        ['row', "He agreed to a contest of champions with Dalinar. Then the power changed hands: Taravangian holds it now."]] },
      { id: 'everstorm', n: 'The Everstorm', c: 'lore', g: 'wor', t: 'The storm from the wrong direction', rel: ['highstorms', 'parshmen'], s: [
        ['wor', "A second storm of red lightning that blows west to east. The listeners in stormform summoned it at Narak, and it has circled the world since."]] },
      // ---- things
      { id: 'gemhearts', n: 'Chasmfiends and Gemhearts', c: 'things', g: 'wok:1', t: 'What the war is really over', rel: ['plains'], s: [
        ['wok:1', "A chasmfiend is a shelled predator the size of a building that lives in the chasms. When one climbs onto a plateau to pupate, both armies race for it, because inside it grows a gemheart: a huge uncut emerald that feeds an army's Soulcasters. Most large Rosharan animals grow a gemheart of some kind."]] },
      { id: 'chulls', n: 'Rosharan Animals', c: 'things', g: 'wok:0', t: 'Shells, not fur', s: [
        ['wok:0', "Chulls are boulder-shelled beasts of burden. Axehounds stand in for dogs, cremlings for insects and rats. Horses are rare and costly, and a Ryshadium, like Dalinar's Gallant, chooses its own rider."]] }
    ],
    trees: [
      { id: 'kholin', n: 'House Kholin', g: 'wok:0', p: [
          ['gavilar', 'Gavilar', 0, 0, { g: 'wok:0', t: 'King, assassinated', x: 'wok:0', e: 'gavilar' }],
          ['navani', 'Navani', 0, 1, { g: 'wok:1', t: [['wok:1', "King's mother"], ['row', 'Bondsmith']], e: 'navani' }],
          ['dalinar', 'Dalinar', 0, 2, { g: 'wok:0', t: [['wok:0', "Gavilar's brother"], ['wok:1', 'The Blackthorn'], ['wor', 'Bondsmith']], x: 'wat', e: 'dalinar' }],
          ['evi', [['wok:2', 'His first wife'], ['ob', 'Evi']], 0, 3, { g: 'wok:2', t: [['wok:2', 'Name forgotten'], ['ob', 'Died at Rathalas']], x: 'wok:2' }],
          ['jasnah', 'Jasnah', 1, 0, { g: 'wok:0', t: [['wok:0', 'Scholar'], ['wor', 'Elsecaller'], ['ob', 'Queen']], e: 'jasnah' }],
          ['elhokar', 'Elhokar', 1, 1, { g: 'wok:0', t: 'King of Alethkar', x: 'ob', e: 'elhokar' }],
          ['aesudan', 'Aesudan', 1, 2, { g: 'ob', t: 'Queen in Kholinar', x: 'ob' }],
          ['renarin', 'Renarin', 1, 3, { g: 'wok:1', t: [['wok:1', 'Younger son'], ['wor', 'Truthwatcher']], e: 'renarin' }],
          ['adolin', 'Adolin', 1, 4, { g: 'wok:1', t: [['wok:1', 'Heir · duelist'], ['ob', 'Highprince']], e: 'adolin' }],
          ['shallan', 'Shallan Davar', 1, 5, { g: 'ob', t: 'Lightweaver', e: 'shallan' }],
          ['gavinor', 'Gavinor', 2, 1, { g: 'ob', t: "Elhokar's son" }]],
        u: [['gavilar', 'navani', 'wok:1'], ['dalinar', 'evi', 'wok:2'], ['navani', 'dalinar', 'ob'], ['elhokar', 'aesudan', 'ob'], ['adolin', 'shallan', 'ob']],
        k: [['gavilar+navani', 'jasnah', ''], ['gavilar+navani', 'elhokar', ''], ['dalinar+evi', 'adolin', ''], ['dalinar+evi', 'renarin', ''], ['elhokar+aesudan', 'gavinor', 'ob']],
        l: [['gavilar', 'dalinar', 'brothers', 'wok:0']] },
      { id: 'kal', n: "Kaladin's family", g: 'wok:1', p: [
          ['lirin', 'Lirin', 0, 0, { g: 'wok:1', t: 'Surgeon', e: 'lirin' }],
          ['hesina', 'Hesina', 0, 1, { g: 'wok:2', t: 'His mother' }],
          ['kaladin', 'Kaladin', 1, 0, { g: 'wok:1', t: [['wok:1', 'Bridge Four'], ['wor', 'Windrunner']], e: 'kaladin' }],
          ['tien', 'Tien', 1, 1, { g: 'wok:1', t: 'Younger brother', x: 'wok:1', e: 'tien' }],
          ['oroden', 'Oroden', 1, 2, { g: 'ob', t: 'Born after he left' }]],
        u: [['lirin', 'hesina', '']], k: [['lirin+hesina', 'kaladin', ''], ['lirin+hesina', 'tien', ''], ['lirin+hesina', 'oroden', '']] },
      { id: 'davar', n: 'House Davar', g: 'wok:1', p: [
          ['lin', 'Lin Davar', 0, 1, { g: 'wok:1', t: [['wok:1', 'Death kept secret'], ['wor', 'Killed by Shallan']], x: 'wok:1' }],
          ['mother', 'Her mother', 0, 2, { g: 'wor', t: 'Killed by Shallan', x: 'wor' }],
          ['helaran', 'Helaran', 1, 0, { g: 'wok:1', t: [['wok:1', 'Eldest · gone'], ['wor', 'Killed by Kaladin']], x: 'wok:1' }],
          ['balat', 'Balat', 1, 1, { g: 'wok:1', t: 'Now the heir' }],
          ['wikim', 'Wikim', 1, 2, { g: 'wok:1', t: 'Brother' }],
          ['jushu', 'Jushu', 1, 3, { g: 'wok:1', t: 'Brother' }],
          ['shallan', 'Shallan', 1, 4, { g: 'wok:1', t: [['wok:1', "Jasnah's ward"], ['wor', 'Lightweaver']], e: 'shallan' }]],
        u: [['lin', 'mother', 'wor']], k: [['lin+mother', 'helaran', ''], ['lin+mother', 'balat', ''], ['lin+mother', 'wikim', ''], ['lin+mother', 'jushu', ''], ['lin+mother', 'shallan', '']] }
    ],
    charts: [
      { id: 'lash', n: 'The Three Lashings', g: 'wok:0', type: 'cards', note: "What the Assassin in White did in the prologue. All three burn Stormlight.", items: [
          { n: 'Basic Lashing', sub: 'Changes which way is down', lines: [['', "Bind a person or object to a different direction, and it falls that way. Szeth ran along walls and ceilings and threw men upward. Lashing something more than once makes it fall faster."]] },
          { n: 'Full Lashing', sub: 'Sticks things together', lines: [['', "Fill a surface with Light and whatever touches it is held fast until the Light runs out."]] },
          { n: 'Reverse Lashing', sub: 'Makes a thing pull', lines: [['', "Give an object a pull of its own, so that other things are drawn to it."]] }] },
      { id: 'ess', n: 'The Ten Essences', g: 'wok:0', type: 'table', note: "From the Ars Arcanum at the back of The Way of Kings: the Vorin tens that Soulcasting follows.", cols: ['#', 'Gemstone', 'Essence', 'Body focus', 'Soulcasts into', 'Virtues'], rows: [
          { c: ['1 Jes', 'Sapphire', 'Zephyr', 'Inhalation', 'Clear gas, air', 'Protecting · Leading'] }, { c: ['2 Nan', 'Smokestone', 'Vapor', 'Exhalation', 'Smoke, fog', 'Just · Confident'] },
          { c: ['3 Chach', 'Ruby', 'Spark', 'The soul', 'Fire', 'Brave · Obedient'] }, { c: ['4 Vev', 'Diamond', 'Lucentia', 'The eyes', 'Quartz, glass, crystal', 'Loving · Healing'] },
          { c: ['5 Palah', 'Emerald', 'Pulp', 'The hair', 'Wood, plants, moss', 'Learned · Giving'] }, { c: ['6 Shash', 'Garnet', 'Blood', 'The blood', 'Blood, any liquid but oil', 'Creative · Honest'] },
          { c: ['7 Betab', 'Zircon', 'Tallow', 'Oil', 'All kinds of oil', 'Wise · Careful'] }, { c: ['8 Kak', 'Amethyst', 'Foil', 'The nails', 'Metal', 'Resolute · Builder'] },
          { c: ['9 Tanat', 'Topaz', 'Talus', 'The bone', 'Rock and stone', 'Dependable · Resourceful'] }, { c: ['10 Ishi', 'Heliodor', 'Sinew', 'Flesh', 'Meat, flesh', 'Pious · Guiding'] }] },
      { id: 'princes', n: "Alethkar's Highprinces", g: 'wok:1', type: 'table', note: 'Ten princedoms, ten warcamps on the Shattered Plains.', cols: ['Highprince', 'What to know'], rows: [
          { c: ['Dalinar Kholin', [['wok:1', "The king's uncle. Keeps the Codes."], ['wok', 'Highprince of War.']]] },
          { c: ['Torol Sadeas', [['wok:1', 'Runs the deadliest bridge crews. Old ally of the Kholins.'], ['wok', 'Left Dalinar to die at the Tower.'], ['wor', 'Killed by Adolin.']]] },
          { c: ['Aladar', [['wok:1', "Sadeas's ally."], ['wor', 'Came over to Dalinar at the end.']]] }, { c: ['Roion', [['wok:1', 'Cautious. Wins the fewest gemhearts.'], ['wor', 'Joined the march. Died at Narak.']]] },
          { c: ['Sebarial', [['wok:1', 'Never goes on plateau runs.'], ['wor', "The first to join Dalinar's march. Shallan's host."]]] }, { c: ['Hatham', [['wok:1', 'A careful politician.']]] },
          { c: ['Vamah', [['wok:2', 'Dalinar tried to win him to a joint assault and was refused.']]] }, { c: ['Thanadal', [['wok:1', 'Keeps his distance from Dalinar.']]] },
          { c: ['Ruthar', [['wok:1', "Sadeas's ally."]]] }, { c: ['Bethab', ''] }] },
      { id: 'orders', n: 'The Knights Radiant', g: 'wok:4', type: 'ring', itemName: 'The ten orders', edgeName: 'The ten Surges', note: [['wok:4', 'Ten orders in a ring. Names fill in as the books give them.'], ['wor', 'Each order holds the two Surges on either side of it, so every Surge is shared by two neighbouring orders.']],
        items: [
          { n: 'Windrunners', sym: 'Wi', g: 'wok:4', tags: [['wor', 'Adhesion · Gravitation']], lines: [['wor', 'Bond honorspren. Oaths of protection. Kaladin.'], ['wor', 'Patron Herald: Jezrien.']] },
          { n: 'Skybreakers', sym: 'Sk', g: 'wor', tags: [['wor', 'Gravitation · Division']], lines: [['wor', 'Bond highspren. Oaths of law. Led by the Herald Nale.'], ['ob', 'The one order that never disbanded. Szeth joined them.']] },
          { n: 'Dustbringers', sym: 'Du', g: 'wor', tags: [['wor', 'Division · Abrasion']], lines: [['ob', 'Bond ashspren. They call themselves Releasers. Malata.'], ['wor', 'Patron Herald: Chanarach.']] },
          { n: 'Edgedancers', sym: 'Ed', g: 'wor', tags: [['wor', 'Abrasion · Progression']], lines: [['wor', 'Bond cultivationspren. Oaths to remember the forgotten. Lift.'], ['wor', 'Patron Herald: Vedel.']] },
          { n: 'Truthwatchers', sym: 'Tr', g: 'wor', tags: [['wor', 'Progression · Illumination']], lines: [['wor', 'Renarin claims this order.'], ['ob', 'Bond mistspren.'], ['wor', 'Patron Herald: Pailiah.']] },
          { n: 'Lightweavers', sym: 'Li', g: 'wor', tags: [['wor', 'Illumination · Transformation']], lines: [['wor', 'Bond Cryptics. After the First Ideal they speak truths about themselves in place of oaths. Shallan.'], ['wor', 'Patron Herald: Shalash.']] },
          { n: 'Elsecallers', sym: 'El', g: 'wor', tags: [['wor', 'Transformation · Transportation']], lines: [['wor', 'Bond inkspren. Jasnah.'], ['wor', 'Patron Herald: Battar.']] },
          { n: 'Willshapers', sym: 'Ws', g: 'wor', tags: [['wor', 'Transportation · Cohesion']], lines: [['row', 'Bond Reachers. Oaths of freedom. Venli.'], ['wor', 'Patron Herald: Kalak.']] },
          { n: 'Stonewards', sym: 'St', g: 'wok:4', tags: [['wor', 'Cohesion · Tension']], lines: [['ob', 'Bond peakspren.'], ['wor', 'Patron Herald: Talenel.']] },
          { n: 'Bondsmiths', sym: 'Bo', g: 'wor', tags: [['wor', 'Tension · Adhesion']], lines: [['wor', 'Only three at a time, each bonded to one of the great spren. Dalinar bonded the Stormfather.'], ['row', 'Navani bonded the Sibling.'], ['wor', 'Patron Herald: Ishar.']] }],
        edges: [
          { n: 'Gravitation', sym: 'Gr', g: 'wor', fx: 'Changes the pull of gravity. The Basic Lashing.' }, { n: 'Division', sym: 'Di', g: 'wor', fx: 'Destruction and decay: burning, turning things to dust.' },
          { n: 'Abrasion', sym: 'Ab', g: 'wor', fx: 'Friction. Makes a surface slick or gripping.' }, { n: 'Progression', sym: 'Pr', g: 'wor', fx: 'Growth and healing.' },
          { n: 'Illumination', sym: 'Il', g: 'wor', fx: 'Light and sound: illusions.' }, { n: 'Transformation', sym: 'Tf', g: 'wor', fx: 'Soulcasting.' },
          { n: 'Transportation', sym: 'Tp', g: 'wor', fx: 'Motion, and crossing into Shadesmar.' }, { n: 'Cohesion', sym: 'Co', g: 'wor', fx: 'Reshapes stone as if it were clay.' },
          { n: 'Tension', sym: 'Te', g: 'wor', fx: 'Makes soft things rigid.' }, { n: 'Adhesion', sym: 'Ad', g: 'wor', fx: 'Binds things together. The Full Lashing.' }] },
      { id: 'heralds', n: 'The Ten Heralds', g: 'wok:0', type: 'table', note: 'Three are named in the Prelude. The rest fill in later.', cols: ['Herald', 'Vorin name', 'What became of them'], rows: [
          { c: ['Jezrien', 'Jezerezeh', [['wok:0', 'King of the Heralds. Walked away in the Prelude.'], ['ob', 'Lived as a beggar in Kholinar. Killed by Moash.']]] },
          { c: ['Kalak', 'Kelek', [['wok:0', 'The viewpoint of the Prelude. Walked away.'], ['row', 'Hiding among the honorspren in Lasting Integrity.']]] },
          { c: ['Talenel', 'Talenelat', [['wok:0', 'The one left behind to hold the pact alone.'], ['wok', 'Arrives at Kholinar in the epilogue.']]] },
          { g: 'wor', c: ['Nale', 'Nalan', [['wor', 'Leads the Skybreakers and kills new Radiants, believing that prevents a Desolation.']]] },
          { g: 'wor', c: ['Shalash', 'Shalash', [['wor', 'Travels the world destroying art that depicts her.']]] },
          { g: 'wor', c: ['Ishar', 'Ishi', [['ob', 'Rules Tukar as the god-priest Tezim.'], ['wat', 'Healed in Shinovar.']]] },
          { g: 'wor', c: ['Chanarach', 'Chana', ''] }, { g: 'wor', c: ['Vedel', 'Vedeledev', ''] },
          { g: 'wor', c: ['Pailiah', 'Pali', ''] }, { g: 'wor', c: ['Battar', 'Battah', ''] }] },
      { id: 'forms', n: 'Listener Forms', g: 'wor', type: 'table', cols: ['Form', 'What it is for'], rows: [
          { c: ['Warform', 'Armour and strength. The form the Alethi fight.'] }, { c: ['Workform', 'Labour and endurance.'] }, { c: ['Nimbleform', 'Dexterity and care. Has hair.'] },
          { c: ['Mateform', 'For bearing children.'] }, { c: ['Dullform', 'Little thought. Used to pass as parshmen.'] }, { c: ['Slaveform', 'No spren at all. What the parshmen are.'] },
          { c: ['Stormform', 'A form of power. Throws lightning, and answers to the old gods.'] }] },
      { id: 'maps', n: 'Maps', g: 'wok:0', type: 'links', note: "Isaac Stewart's maps from the books. Each link opens the map alone.", items: [
          { n: 'Roshar', sub: 'The whole continent', url: 'https://fantasy-maps-explorer.pages.dev/maps/stormlight-archive-roshar' }, { n: 'The Shattered Plains', sub: 'Plateaus and warcamps', url: 'https://fantasy-maps-explorer.pages.dev/maps/stormlight-archive-way-of-kings-shattered-plains' },
          { n: 'Alethkar', sub: 'Kholinar and the princedoms', url: 'https://fantasy-maps-explorer.pages.dev/maps/stormlight-archive-way-of-kings-alethkar' }, { n: "Sadeas's warcamp", sub: 'Where Bridge Four lives', g: 'wok:1', url: 'https://fantasy-maps-explorer.pages.dev/maps/stormlight-archive-sadeas-warcamp' },
          { n: 'The Battle of the Tower', sub: 'The plateau assault', g: 'wok', url: 'https://fantasy-maps-explorer.pages.dev/maps/stormlight-archive-way-of-kings-battle-of-the-tower' }, { n: 'Shadesmar', sub: 'The sea of beads', g: 'ob', url: 'https://fantasy-maps-explorer.pages.dev/maps/stormlight-archive-shadesmar' }] }
    ] });
})();
