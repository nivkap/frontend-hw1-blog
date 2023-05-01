import React from "react";
import type { GetServerSideProps } from "next";
import Layout from "../components/Layout";
import Post, { PostProps } from "../components/Post";
import prisma from '../lib/prisma'
import { getSession } from "next-auth/react";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const pageNumber = parseInt((context.query.page as string) || "1");
  const postsPerPage = 10;
  const postsAmount = await prisma.post.count({
    where: {
      published: true,
    },
  });

  const totalNumberOfPages = Math.ceil(postsAmount / postsPerPage);
  
  const session = await getSession({req: context.req});

  const getCurrentUserID = async () => {
    const user = await prisma.user.findFirst({
      where: {
        email: {equals: session?.user?.email}
      }
    });

    if(user === null) 
      return -1;


    return user.id;
  }
  
  const feed = await getCurrentPagePosts(pageNumber, await getCurrentUserID())

  return {
    props: { feed, pageNumber, totalNumberOfPages },
  };

};

type Props = {
  feed: PostProps[];
  pageNumber: number;
  totalNumberOfPages: number;
};



const getCurrentPagePosts = async (page:number, sessionUserId: number) => {
  const postsPerPage = 10;
  const content = await prisma.post.findMany({
    orderBy: {
      id: 'asc'
    },
    where: {
      OR:
      [ 
        {published: true},
        {authorId: {equals: sessionUserId}}
      ]
    
    },
    take: postsPerPage * (page - 1)
  })
  .then(posts => {
    if(posts.length === 0) 
      return -1
    return posts[posts.length-1].id
  })
  .then(prevId => prisma.post.findMany({
    orderBy: {
      id: 'asc'
    },
    take: postsPerPage,
    where: {
      OR:
      [ 
        {published: true},
        {authorId: {equals: sessionUserId}}
      ],
      id: {
        gt: prevId
      }
    },
    include: {
      author: {
        select: {
          name: true,
        },
      },
    },
  }))
  return content;
}  


const Blog: React.FC<Props> = (props) => {

  const changePage = (newPage: number) => {
    window.location.href = `/?page=${newPage}`;
  };

  // Prepering the numbers of the buttons
  const pageNumbers = [];
  for (let i = 1; i <= props.totalNumberOfPages; i++) {
    pageNumbers.push(i);
  }
  

  return (
    <Layout>
      <div className="page">
        <h1>Public Feed</h1>
          <h2>Page {props.pageNumber} / {props.totalNumberOfPages}</h2>
          <main>
            {props.feed.map((post) => (
              <div key={post.id} className="post">
                <Post post={post} />
              </div>
            ))}
          </main>
        <nav>
          <ul className="pagination">
            {pageNumbers.map((number) => (
              <li key={number} className="page-item">  {/* we can use button instead of a and remove href - changing the reloading*/}
                <a
                  href="#"
                  className={`page-link ${props.pageNumber === number ? "active" : ""}`}
                  onClick={() => changePage(number)}
                >
                  {number}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <style jsx>{`
        .post {
          background: white;
          transition: box-shadow 0.1s ease-in;
        }

        .post:hover {
          box-shadow: 1px 1px 3px #aaa;
        }

        .post + .post {
          margin-top: 2rem;
        }

        .pagination {
          display: flex;
          overflow-x: auto;
          white-space: nowrap;
          padding-bottom: 1rem;
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }
        
        .pagination::-webkit-scrollbar {
          display: none; /* Hide scrollbar for Chrome, Safari and Opera */
        }
        
        .page-item {
          margin: 0 0.5rem;
          display: inline-block;
          white-space: nowrap;
        }
        
      `}</style>
    </Layout>
  );
};

export default Blog;
