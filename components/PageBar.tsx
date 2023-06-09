import React from "react";


export const PageBar: React.FC<{ totalNumberOfPages: number, pageNumber: number, pageNumbers: number[], changePage: (pn: number) => void }> =
  ({ totalNumberOfPages, pageNumber, pageNumbers , changePage}) => {
    
    return (
      <>
        <div className="pagination">
          <button disabled={pageNumber === 1} onClick={() => changePage(1)}>
             First
            </button>
            <button disabled={pageNumber === 1} onClick={() => changePage(pageNumber - 1)}>
             Previous
           </button>
           {pageNumbers.map((page) => (
            <button
              key={page}
              className={pageNumber === page ? 'active' : ''}
              onClick={() => changePage(page)}
            >
              {page}
            </button>
          ))}
          <button disabled={pageNumber === totalNumberOfPages} onClick={() => changePage(pageNumber + 1)}>
            Next
          </button>
          <button disabled={pageNumber === totalNumberOfPages} onClick={() => changePage(totalNumberOfPages)}>
            Last
          </button>
        </div>
        <style jsx>{`
            .pagination {
                display: flex;
                align-items: center;
                justify-content: center;
                margin-top: 1rem;
              }
            
              .pagination button {
                padding: 0.5rem 1rem;
                margin: 0 0.25rem;
                background-color: #f0f0f0;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                transition: background-color 0.3s ease;
              }
            
              .pagination button.active {
                background-color: #666;
                color: #fff;
                font-weight: bold;
              }
            
              .pagination button:disabled {
                cursor: not-allowed;
                opacity: 0.6;
              }
            
              .pagination input {
                margin: 0 0.5rem;
                padding: 0.25rem;
                width: 4rem;
                text-align: center;
              }
            `}
        </style>
      </>
    );
  }