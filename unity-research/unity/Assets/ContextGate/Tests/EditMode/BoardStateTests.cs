using NUnit.Framework;

namespace Jonghoon.ContextGate.Tests
{
    public sealed class BoardStateTests
    {
        [Test] public void MovedSourceInvalidatesAdvice()
        {
            var b = new BoardState(new[] { 3, 4, 5 });
            var h = b.Plan("r1", 1);
            Assert.IsTrue(b.Move(0, 0, out _));
            Assert.IsFalse(b.Applicable(h, out var why));
            Assert.AreEqual("source_changed", why);
        }

        [Test] public void UnrelatedMovePreservesApplicableAdvice()
        {
            var b = new BoardState(new[] { 3, 4, 5 });
            var h = b.Plan("r1", 1);
            b.Move(1, 1, out _);
            Assert.AreNotEqual(h.revision, b.Revision);
            Assert.IsTrue(b.Applicable(h, out _));
        }

        [Test] public void OccupiedDestinationInvalidatesAdvice()
        {
            var b = new BoardState(new[] { 3, 4, 5 });
            var h = b.Plan("r1", 1);
            b.Move(1, 0, out _);
            Assert.IsFalse(b.Applicable(h, out var why));
            Assert.AreEqual("destination_occupied", why);
        }

        [Test] public void CallerCannotMutateSnapshotOrConstructorInput()
        {
            var input = new[] { 3, 4, 5 };
            var b = new BoardState(input);
            input[0] = 0;
            var copy = b.CopyPositions(); copy[1] = 1;
            Assert.AreEqual(3, b.SlotOf(0));
            Assert.AreEqual(4, b.SlotOf(1));
        }

        [Test] public void RejectedMoveDoesNotAdvanceRevision()
        {
            var b = new BoardState(new[] { 3, 4, 5 });
            Assert.IsFalse(b.Move(0, 4, out _));
            Assert.AreEqual(0, b.Revision);
            Assert.IsFalse(b.WellFormed(new PlacementHint { requestId = "r", token = 0, from = 3, to = 999 }));
        }

        [Test] public void CyclesHaveALegalBufferMoveAndReachGoal()
        {
            var b = new BoardState(new[] { 1, 2, 0 });
            for (int i = 0; i < 12 && !b.Solved; i++)
            {
                var h = b.Plan("r" + i, 1);
                Assert.IsNotNull(h);
                Assert.IsTrue(b.Applicable(h, out _));
                Assert.IsTrue(b.Move(h.token, h.to, out _));
            }
            Assert.IsTrue(b.Solved);
            Assert.IsNull(b.Plan("done", 1));
        }

        [Test] public void SeededLayoutsRemainUniqueAndSolvable()
        {
            for (int seed = 0; seed < 128; seed++)
            {
                var a = BoardState.Create(seed);
                CollectionAssert.AreEqual(a.CopyPositions(), BoardState.Create(seed).CopyPositions());
                for (int i = 0; i < 12 && !a.Solved; i++)
                {
                    var h = a.Plan("r" + i, 1);
                    Assert.IsNotNull(h);
                    Assert.IsTrue(a.Move(h.token, h.to, out _));
                }
                Assert.IsTrue(a.Solved, "Seed " + seed);
            }
        }

        [Test] public void PairedConditionsUseIdenticalBoardSeedsAndOppositePolicyOrder()
        {
            var a = SessionDesign.Build(new SessionConfig { seed = 7, pairs = 3 });
            var b = SessionDesign.Build(new SessionConfig { seed = 7, pairs = 3, reverseFirstPolicy = true });
            Assert.AreEqual(6, a.Count);
            for (int i = 0; i < a.Count; i += 2)
            {
                Assert.AreEqual(a[i].boardSeed, a[i + 1].boardSeed);
                Assert.AreNotEqual(a[i].policy, a[i + 1].policy);
                Assert.AreEqual(a[i].boardSeed, b[i].boardSeed);
                Assert.AreNotEqual(a[i].policy, b[i].policy);
            }
        }
    }
}
