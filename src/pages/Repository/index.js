import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'

import api from '../../services/api'

import Container from '../../components/Container'
import {
  Loading,
  Owner,
  IssueList,
  PaginateContainer,
  PaginateButton,
} from './styles'
export default class Repository extends Component {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        repository: PropTypes.string,
      }),
    }).isRequired,
  }

  state = {
    repository: {},
    issues: [],
    loading: true,
    issueState: 'open',
    page: 1,
  }

  getRepoInfo = async () => {
    const { match } = this.props
    const { issueState, page } = this.state
    const repoName = decodeURIComponent(match.params.repository)

    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state: issueState,
          per_page: 5,
          page: page,
        },
      }),
    ])

    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false,
    })
    console.log(repository, issues)
  }

  componentDidMount() {
    this.getRepoInfo()
  }

  componentDidUpdate(_, prevState) {
    const { issueState, page } = this.state

    if (prevState.issueState !== issueState || prevState.page !== page) {
      this.getRepoInfo()
    }
  }

  render() {
    const { repository, issues, loading, page } = this.state

    if (loading) {
      return <Loading>Carregando</Loading>
    }
    return (
      <Container>
        <Owner>
          <Link to="/">Voltar aos repositórios</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
          <select
            value={this.state.issueState}
            onChange={e => this.setState({ issueState: e.target.value })}
          >
            <option value="all">Todos</option>
            <option value="open">Abertos</option>
            <option value="closed">Fechados</option>
          </select>
        </Owner>
        <IssueList>
          {issues.map(issue => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a href={issue.html_url}>{issue.title}</a>
                  {issue.labels.map(label => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
        </IssueList>
        <PaginateContainer>
          <PaginateButton
            disabled={page === 1 ? 1 : 0}
            onClick={() => this.setState({ page: page - 1 })}
          >
            Anterior
          </PaginateButton>
          <PaginateButton onClick={() => this.setState({ page: page + 1 })}>
            Próximo
          </PaginateButton>
        </PaginateContainer>
      </Container>
    )
  }
}
