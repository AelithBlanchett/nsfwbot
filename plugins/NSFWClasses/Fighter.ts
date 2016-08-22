class Fighter{
    id: number;
    name: string;
    experience: number;
    experienceSpent: number;
    power: number;
    dexterity: number;
    toughness: number;
    endurance: number;
    willpower: number;

    //during fight
    hp: number;
    heartsRemaining: number;
    lust: number;
    lustRemaining: number;
    focus: number;
    lastAttack: string;
    usedAttacks: Array<string>;

    hpPerHeart(){
        return (10 + this.power + this.dexterity + (this.toughness*2) + this.endurance);
    }

    maxHearts(){
        return this.toughness;
    }

    lustPerOrgasm(){
        return (10 + this.power + this.dexterity + this.toughness* + (this.endurance*2));
    }

    maxOrgasms(){
        return this.endurance;
    }

    hitHp(hp){
        hp = Math.floor(hp);
        if(hp < 1){
            hp = 1;
        }

    }


}