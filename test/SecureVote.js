const {
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("SecureVote", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deploySecureVoteFixture() {
    // Contracts are deployed using the first signer/account by default
    const accounts = await ethers.getSigners();
    const owner = accounts[0];
    const otherAccount = accounts[1];

    const _electionName = "CEO election";
    const _electionDescription = "Employees will choose their CEO";
    const _proposalsName = ["John", "Don"];

    const expected_proposals = [{
      name: "John",
      voteCount: 0
    }, {
      name: "Don",
      voteCount: 0
    }]

    const SecureVote = await ethers.getContractFactory("SecureVote");
    const secureVote = await SecureVote.deploy();

    return { secureVote, _electionName, _electionDescription, _proposalsName, owner, otherAccount };
  }

  describe("Deployment", function () {

    it("Should set the right owner", async function () {
      const { secureVote, owner } = await loadFixture(deploySecureVoteFixture);

      expect(await secureVote.owner()).to.equal(owner.address);
    });
  });

  describe("Smart Contract Functionality", function () {

    describe("Check variable properly", function () {
      it("Should set the right owner", async function () {
        const { secureVote, owner } = await loadFixture(deploySecureVoteFixture);

        expect(await secureVote.owner()).to.equal(owner.address);
      });
    })

    describe("Check methods", function () {

      describe("createNewElection", function () {
        it("Only owner of the Smart Contract can create a new election", async function () {
          const { secureVote, _electionName, _electionDescription, _proposalsName } = await loadFixture(deploySecureVoteFixture);
          await secureVote.createNewElection(_electionName, _electionDescription, _proposalsName);
        });

        it("Reverted when non owner wants to create a new election", async function () {
          const { secureVote, otherAccount, _electionName, _electionDescription, _proposalsName } = await loadFixture(deploySecureVoteFixture);
          await expect(secureVote.connect(otherAccount).createNewElection(_electionName, _electionDescription, _proposalsName)).to.be.revertedWith('Not owner');
        });
      })

      describe("giveRightToVote", function () {
        it("Only owner of the Smart Contract can give the right to vote", async function () {
          const { secureVote, otherAccount, _electionName, _electionDescription, _proposalsName } = await loadFixture(deploySecureVoteFixture);
          await secureVote.createNewElection(_electionName, _electionDescription, _proposalsName);
          await secureVote.giveRightToVote(0, otherAccount.address);
        });

        it("Reverted when non owner wants to give the right to vote", async function () {
          const { secureVote, otherAccount, _electionName, _electionDescription, _proposalsName } = await loadFixture(deploySecureVoteFixture);
          await secureVote.createNewElection(_electionName, _electionDescription, _proposalsName);
          await expect(secureVote.connect(otherAccount).giveRightToVote(0, otherAccount.address)).to.be.revertedWith('Only chairperson can give right to vote.');
        });

        it("Reverted when the voter is already voted", async function () {
          const { secureVote, owner, otherAccount, _electionName, _electionDescription, _proposalsName } = await loadFixture(deploySecureVoteFixture);
          await secureVote.createNewElection(_electionName, _electionDescription, _proposalsName);
          await secureVote.giveRightToVote(0, otherAccount.address);
          await secureVote.connect(otherAccount).giveVote(0, 0);
          await expect(secureVote.connect(owner).giveRightToVote(0, otherAccount.address)).to.be.revertedWith("The voter already voted.");
        });

        it("Reverted when the owner given the right to vote earlier", async function () {
          const { secureVote, otherAccount, _electionName, _electionDescription, _proposalsName } = await loadFixture(deploySecureVoteFixture);
          await secureVote.createNewElection(_electionName, _electionDescription, _proposalsName);
          await secureVote.giveRightToVote(0, otherAccount.address);
          await expect(secureVote.giveRightToVote(0, otherAccount.address)).to.be.revertedWith("Already given the right to vote.");
        });
      })

      describe('giveVote', function () {
        it("Properly vote when the voting is not ended yet", async function () {
          const { secureVote, otherAccount, _electionName, _electionDescription, _proposalsName } = await loadFixture(deploySecureVoteFixture);
          await secureVote.createNewElection(_electionName, _electionDescription, _proposalsName);
          await secureVote.giveRightToVote(0, otherAccount.address);
          await secureVote.connect(otherAccount).giveVote(0, 0);
        });

        it("Reverted vote when the voting is ended", async function () {
          const { secureVote, otherAccount, _electionName, _electionDescription, _proposalsName } = await loadFixture(deploySecureVoteFixture);
          await secureVote.createNewElection(_electionName, _electionDescription, _proposalsName);
          await secureVote.giveRightToVote(0, otherAccount.address);
          await secureVote.endingVoting(0);
          await expect(secureVote.connect(otherAccount).giveVote(0, 0)).to.be.revertedWith("Votting ended.");
        });

        it("Reverted vote when the user don't have right to vote", async function () {
          const { secureVote, otherAccount, _electionName, _electionDescription, _proposalsName } = await loadFixture(deploySecureVoteFixture);
          await secureVote.createNewElection(_electionName, _electionDescription, _proposalsName);
          await expect(secureVote.connect(otherAccount).giveVote(0, 0)).to.be.revertedWith("Has no right to vote.");
        });

        it("Reverted vote when the user already voted", async function () {
          const { secureVote, otherAccount, _electionName, _electionDescription, _proposalsName } = await loadFixture(deploySecureVoteFixture);
          await secureVote.createNewElection(_electionName, _electionDescription, _proposalsName);
          await secureVote.giveRightToVote(0, otherAccount.address);
          await secureVote.connect(otherAccount).giveVote(0, 0);
          await expect(secureVote.connect(otherAccount).giveVote(0, 0)).to.be.revertedWith("Already voted.");
        });
      })

      describe("endingVoting", function () {
        it("Only the owner can end the voting", async function () {
          const { secureVote, _electionName, _electionDescription, _proposalsName } = await loadFixture(deploySecureVoteFixture);
          await secureVote.createNewElection(_electionName, _electionDescription, _proposalsName);
          await secureVote.endingVoting(0);
        });

        it("Reverted when non owner try to end voting", async function () {
          const { secureVote, otherAccount, _electionName, _electionDescription, _proposalsName } = await loadFixture(deploySecureVoteFixture);
          await secureVote.createNewElection(_electionName, _electionDescription, _proposalsName);
          await expect(secureVote.connect(otherAccount).endingVoting(0)).to.be.revertedWith("Only Chiarpersone can end the voting session!");
        });
      })

      describe("getStatisticsOfAllVote", function () {
        it("Return Array of Statisctics", async function () {
          const { secureVote, owner, otherAccount, _electionName, _electionDescription, _proposalsName } = await loadFixture(deploySecureVoteFixture);
          await secureVote.createNewElection(_electionName, _electionDescription, _proposalsName);

          const _second_electionName = "Captain election";
          const _second__electionDescription = "Students will choose their captain";
          const _second_proposalsName = ["Habib", "Hridoy"];

          await secureVote.createNewElection(_second_electionName, _second__electionDescription, _second_proposalsName);

          await secureVote.giveRightToVote(0, otherAccount.address);
          await secureVote.giveRightToVote(1, otherAccount.address);

          await secureVote.connect(otherAccount).giveVote(0, 0);
          await secureVote.connect(otherAccount).giveVote(1, 0);

          await secureVote.connect(owner).endingVoting(0);
          await secureVote.connect(owner).endingVoting(1);

          console.log(await secureVote.connect(owner).getStatisticsOfAllVote());

          await secureVote.connect(owner).getStatisticsOfAllVote();
        });
      })

      describe("winningProposal", function () {
        it("Return winning proposal for an election", async function () {
          const { secureVote, owner, otherAccount, _electionName, _electionDescription, _proposalsName } = await loadFixture(deploySecureVoteFixture);
          await secureVote.createNewElection(_electionName, _electionDescription, _proposalsName);

          const _second_electionName = "Captain election";
          const _second__electionDescription = "Students will choose their captain";
          const _second_proposalsName = ["Habib", "Hridoy"];

          await secureVote.createNewElection(_second_electionName, _second__electionDescription, _second_proposalsName);

          await secureVote.giveRightToVote(0, otherAccount.address);
          await secureVote.giveRightToVote(1, otherAccount.address);

          await secureVote.connect(otherAccount).giveVote(0, 0);
          await secureVote.connect(otherAccount).giveVote(1, 0);

          await secureVote.connect(owner).endingVoting(0);
          await secureVote.connect(owner).endingVoting(1);

          await expect(String(await secureVote.connect(owner).winningProposal(0))).to.be.equals("0");
          await expect(String(await secureVote.connect(owner).winningProposal(0))).to.be.not.equals("1");
        });
      })
    })

  });

});
