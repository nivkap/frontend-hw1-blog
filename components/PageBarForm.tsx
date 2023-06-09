import React from "react";


export const PageBarForm: React.FC<{ formPage: number, changeFormPage: (formPageChange: React.FormEvent<HTMLInputElement>) => void, changePage: (pn: number) => void }> =
  ({ formPage, changeFormPage, changePage}) => {
    
    return (
      <>
        <div className="pagination-open-text">
          <form onSubmit={(form) => {
            form.preventDefault();
            changePage(formPage);
          }}>
            <label>
              <input type="number" value={formPage} onChange={changeFormPage} />
            </label>
            <input type="submit" value="Go to page" />
          </form>
        </div>
        <style jsx>{`
            .pagination-open-text {
                display: flex;
                justify-content: center;
                align-items: center;
                margin: 20px 0;
              }
              
              .pagination-open-text form {
                display: flex;
                align-items: center;
              }
              
              .pagination-open-text label {
                font-size: 18px;
                margin-right: 10px;
              }
              
              .pagination-open-text input[type="number"] {
                width: 70px;
                padding: 5px;
                font-size: 16px;
                border: 1px solid #ccc;
                border-radius: 4px;
              }
              
              .pagination-open-text input[type="submit"] {
                padding: 5px 10px;
                background-color: #4CAF50;
                color: #fff;
                font-size: 16px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
              }
              
              .pagination-open-text input[type="submit"]:hover {
                background-color: #3e8e41;
              }
            `}
        </style>
      </>
    );
  }