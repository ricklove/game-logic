export const getVerses = () => {
    return versesRaw
        .split(`#`)
        .filter(x => x)
        .map(x => {
            const [r, ...v] = x.split(`\n`)
                .map(x => x.trim())
                ;
            return ({
                verses: v.filter(x => x),
                reference: r.replace(/^#/, ``).trim(),
            });
        })
        .filter(x => x.verses.length && x.reference)
        ;
};

export const getVerseProblems = () => {
    return getVerses()
        .map(x => {
            return {
                section: x.reference,
                problems: [
                    {
                        name: x.reference,
                        prephrase: ``,
                        phrase: x.reference,
                    },
                    ...x.verses.map((v, i) => ({
                        name: `${x.reference} [${i + 1}/${x.verses.length}]`,
                        prephrase: `${x.reference}\n${x.verses.slice(0, i).join(` `)}`,
                        phrase: v,
                    })),
                ],
            };
        })
        ;
};

const versesRaw = `
# Matthew 5:1-12
1 Seeing the crowds, he went up on the mountain, and when he sat down, his disciples came to him. 
2 And he opened his mouth and taught them, saying:
3 “Blessed are the poor in spirit, for theirs is the kingdom of heaven.
4 “Blessed are those who mourn, for they shall be comforted.
5 “Blessed are the meek, for they shall inherit the earth.
6 “Blessed are those who hunger and thirst for righteousness, for they shall be satisfied.
7 “Blessed are the merciful, for they shall receive mercy.
8 “Blessed are the pure in heart, for they shall see God.
9 “Blessed are the peacemakers, for they shall be called sons of God.
10 “Blessed are those who are persecuted for righteousness' sake, for theirs is the kingdom of heaven.
11 “Blessed are you when others revile you and persecute you and utter all kinds of evil against you falsely on my account. 
12 Rejoice and be glad, for your reward is great in heaven, for so they persecuted the prophets who were before you.

# 1 Corinthians 13:4-5
Love is patient and kind; love does not envy or boast; it is not arrogant or rude. It does not insist on its own way; it is not irritable or resentful. 

# Hebrews 13:8
Jesus Christ is the same yesterday and today and forever. 

# 1 Chronicles 16:11
Seek the LORD and his strength; seek his presence continually! 

# 1 Thessalonians 5:16
Rejoice always 

# Psalm 56:3
When I am afraid, I put my trust in you. 

# Psalm 37:3
Trust in the LORD, and do good; dwell in the land and befriend faithfulness 

`;
