import { useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Container, View } from 'reshaped'
import { PageHeader } from '../components/custom/PageHeader'
import { BoardsDirectory, BoardWorkspace } from '../components/boards'
import { useBoardsStore } from '../store/useBoardsStore'
import { useTeamsStore } from '../store/useTeamsStore'
import type { BoardCard } from '../store/useBoardsStore'

export default function BoardsPage() {
  const { boardId } = useParams<{ boardId?: string }>()
  const navigate = useNavigate()

  const boards = useBoardsStore((state) => state.boards)
  const boardsLoading = useBoardsStore((state) => state.boardsLoading)
  const fetchBoards = useBoardsStore((state) => state.fetchBoards)
  const selectedBoard = useBoardsStore((state) => state.selectedBoard)
  const boardLoading = useBoardsStore((state) => state.boardLoading)
  const fetchBoard = useBoardsStore((state) => state.fetchBoard)
  const createCard = useBoardsStore((state) => state.createCard)
  const updateCard = useBoardsStore((state) => state.updateCard)
  const moveCard = useBoardsStore((state) => state.moveCard)
  const deleteCard = useBoardsStore((state) => state.deleteCard)

  const teams = useTeamsStore((state) => state.teams)
  const fetchTeams = useTeamsStore((state) => state.fetchTeams)

  useEffect(() => {
    fetchBoards()
    fetchTeams()
  }, [fetchBoards, fetchTeams])

  useEffect(() => {
    if (boardId) {
      fetchBoard(boardId)
    }
  }, [boardId, fetchBoard])

  const firstBoardId = useMemo(() => (boards.length > 0 ? boards[0].id : undefined), [boards])

  useEffect(() => {
    if (!boardId && firstBoardId) {
      navigate(`/boards/${firstBoardId}`, { replace: true })
    }
  }, [boardId, firstBoardId, navigate])

  const handleSelectBoard = (id: string) => {
    if (id !== boardId) {
      navigate(`/boards/${id}`)
    }
  }

  const handleCreateCard = async (columnId: string, payload: { title: string; description?: string }) => {
    const currentBoardId = selectedBoard?.board.id
    if (!currentBoardId) {
      return
    }
    await createCard({
      boardId: currentBoardId,
      columnId,
      title: payload.title,
      description: payload.description,
    })
  }

  const handleUpdateCard = async (
    cardId: string,
    payload: Partial<Pick<BoardCard, 'title' | 'description' | 'status' | 'assigneeTeamId'>>
  ) => {
    await updateCard({
      cardId,
      title: payload.title,
      description: payload.description,
      status: payload.status,
      assigneeTeamId: payload.assigneeTeamId,
    })
  }

  const handleMoveCard = async (cardId: string, columnId: string, position: number) => {
    await moveCard({ cardId, columnId, position })
  }

  const handleDeleteCard = async (cardId: string) => {
    await deleteCard(cardId)
  }

  return (
    <Container width="wide">
      <View direction="column" gap={6}>
        <PageHeader
          title="Boards workspace"
          subtitle="Route action plans to the right teams and track progress across dedicated boards."
        />

        <View
          direction="row"
          gap={4}
          align="start"
          wrap
          attributes={{
            style: { minHeight: '400px' },
          }}
        >
          <View
            direction="column"
            gap={4}
            attributes={{
              style: {
                flex: '0 0 320px',
                maxWidth: '360px',
              },
            }}
          >
            <BoardsDirectory
              boards={boards}
              teams={teams}
              selectedBoardId={boardId}
              loading={boardsLoading}
              onSelect={handleSelectBoard}
            />
          </View>

          <View
            direction="column"
            gap={4}
            attributes={{
              style: {
                flex: '1 1 480px',
                minWidth: '0',
              },
            }}
          >
            <BoardWorkspace
              board={selectedBoard}
              teams={teams}
              loading={boardLoading && Boolean(boardId)}
              onCreateCard={handleCreateCard}
              onUpdateCard={handleUpdateCard}
              onMoveCard={handleMoveCard}
              onDeleteCard={handleDeleteCard}
            />
          </View>
        </View>
      </View>
    </Container>
  )
}

