import { QuestionGroup } from "./question-group.model";

export class Questionary {
    logo?: string;
    title: string;
    description: string;
    nom?: string;
    prenom?: string;
    age?: number;
    genre?: string;
    questionGroups: QuestionGroup[];

    constructor(type: string) {
        
    }

    public static getMinor(nom: string, prenom: string, age: number, genre: string): Questionary {
        return {
            title: 'Attestation de santé pour les mineurs',
            description: `Faire du sport : c'est recommandé pour tous. En as-tu parlé avec un médecin ?
            Ce questionnaire n'est pas un contrôle. Tu réponds par OUI ou par NON, mais il n'y a pas de bonnes ou mauvaises réponses.
            Tu peux regarder ton carnet de santé et demander à tes parents de t'aider`,
            nom: nom,
            prenom: prenom,
            age: age,
            genre: genre,
            questionGroups: [
                {
                    title: 'Depuis l\'année dernière',
                    items: [
                        {
                            question: 'Es-tu allé(e) à l\'hôpital pendant toute une journée ou plusieurs jours ?',
                            answer: false
                        },
                        {
                            question: 'As-tu été(e) opéré(e) ?',
                            answer: false
                        },
                        {
                            question: 'As-tu beacoup plus grandi que les autres années ?',
                            answer: false
                        },
                        {
                            question: 'As-tu beaucoup maigri ou grossi ?',
                            answer: false
                        },
                        {
                            question: 'As-tu eu la tête qui tourne pendant un effort ?',
                            answer: false
                        },
                        {
                            question: 'As-tu perdu connaissance ou es-tu tombé(e) sans te souvenir de ce qui s\'est passé ?',
                            answer: false
                        },
                        {
                            question: 'As-tu reçu un ou plusieurs chocs violents qui t\'ont obligé(e) à interrompre un moment la séance de sport ?',
                            answer: false
                        },
                        {
                            question: 'As-tu eu beaucoup de mal à respirer pendant un effort par rapport à d\'habitude ?',
                            answer: false
                        },
                        {
                            question: 'As-tu eu beaucoup de mal à respirer après un effort ?',
                            answer: false
                        },
                        {
                            question: 'As-tu eu mal dans la poitrine ou des palpitations (le coeur qui bat très vite) ?',
                            answer: false
                        },
                        {
                            question: 'As-tu commencé à prendre un nouveau médicament tous les jours et pour longtemps ?',
                            answer: false
                        },
                        {
                            question: 'As-tu arrêté le sport à cause d\'un problème de santé pendant un mois ou plus ou depuis un certain temps (plus de 2 semaines) ?',
                            answer: false
                        },
                        {
                            question: 'Te sens-tu très fatigué(e) ?',
                            answer: false
                        },
                        {
                            question: 'As-tu du mal à t\'endormir ou te réveilles-tu souvent dans la nuit ?',
                            answer: false
                        },
                        {
                            question: 'Sens-tu que tu as moins faim, que tu manges moins ?',
                            answer: false
                        },
                        {
                            question: 'Te sens-tu triste ou inquiet ?',
                            answer: false
                        },
                        {
                            question: 'Pleures-tu souvent ?',
                            answer: false
                        },
                        {
                            question: 'Ressens-tu une douleur ou un manque de force à cause d\'une blessure que tu t\'es faite cette année ?',
                            answer: false
                        }
                    ]
                },
                {
                    title: 'Aujourd\'hui',
                    items: [
                        {
                            question: 'Penses-tu quelquefois arrêter de fair du sport ou à changer de sport ?',
                            answer: false
                        },
                        {
                            question: 'Penses-tu avoir besoin de voir ton médecin pour continuer le sport ?',
                            answer: false
                        },
                        {
                            question: 'Souhaites-tu signaler quelque chose de plus concernant ta santé ?',
                            answer: false
                        },
                    ]
                },
                {
                    title: 'Questions à faire remplir par tes parents',
                    items: [
                        {
                            question: 'QUelqu\'un dans votre famille proche a-t-il eu une maladie grave du coeur ou du cerveau, ou est-il décédé subitement avant l\'âge de 50 ans ?',
                            answer: false
                        },
                        {
                            question: 'Etes-vous inquiet pour son poids ? Trouvez-vous qu\'il se nourrit trop ou pas assez ?',
                            answer: false
                        },
                        {
                            question: 'Avez-vous manqué l\'examen de santé prévu à l\'âge de votre enfant chez le médecin ? Cet examen est prévu à l\'âge de 2 ans, 3 ans, 4 ans, 5 ans, entre 8 et 9 ans, entre 11 et 13 ans et entre 15 et 16 ans.',
                            answer: false
                        },
                    ]
                }
            ]
        };
    }

    public static getMajor(): Questionary {
        return {
            logo: 'assets/images/logos/rf.png',
            title: 'Renouvellement de licence d\'une Fédération sportive',
            description: 'Ce questionnaire de santé permet de savoir si vous devez fournir un certificat médical pour renouveler votre licence sportive.',
            questionGroups: [
                {
                    title: 'Durant les 12 derniers mois',
                    items: [
                        {
                            question: 'Un membre de votre famille est-il décédé subitement d\'une cause cardiaque ou inexpliquée ?',
                            answer: false
                        },
                        {
                            question: 'Avez-vous resenti une douleur dans la poitrine, des palpitations, un essouflement inhabituel ou un malaise ?',
                            answer: false
                        },
                        {
                            question: 'Avez-vous eu un épisode de respiration sifflante (asthme) ?',
                            answer: false
                        },
                        {
                            question: 'Avez-vous eu une perte de connaissance ?',
                            answer: false
                        },
                        {
                            question: 'Si vous avez arrêté le sport pendant 30 jours ou plus pour des raisons de santé, avez-vous repris sans l\'accord d\'un médecin ?',
                            answer: false
                        },
                        {
                            question: 'Avez-vous débuté un traitement médical de longue durée (hors contraception et désensibilisation aux allergies) ?',
                            answer: false
                        }
                    ]
                },
                {
                    title: 'A ce jour',
                    items: [
                        {
                            question: 'Ressentez-vous une douleur, un manque de force ou une raideur suite à un problème osseux, articulaire ou musculaire (fracture, entorse, luxation, déchirure, tendinite, etc...) survenu durant les 12 derniers mois ?',
                            answer: false
                        },
                        {
                            question: 'Votre pratique sportive est-elle interrompue pour des raisons de santé ?',
                            answer: false
                        },
                        {
                            question: 'Pensez-vous avoir besoin d\'un avis médical pour poursuivre votre pratique sportive ?',
                            answer: false
                        }
                    ]
                }
            ]
        };
    }
}